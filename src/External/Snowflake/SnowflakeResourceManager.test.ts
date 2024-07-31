import SnowflakeResourceManager from './SnowflakeResourceManager';
import type { ExternalAPI, SyncFeedback } from './SnowflakeResourceManager';

const mockExternalAPI: ExternalAPI = {
    runTransaction: jest.fn(),
    getLastKnownRemoteState: jest.fn(),
    setLastKnownRemoteState: jest.fn(),
    getRemoteResourceData: jest.fn(),
    setRemoteResourceData: jest.fn()
};

describe('SnowflakeResourceManager', () => {
    let resourceManager: SnowflakeResourceManager;
    const resourceId = 'test-resource-id';
    const resourceData = { foo: 'bar' };

    beforeEach(() => {
        jest.clearAllMocks();
        resourceManager = new SnowflakeResourceManager(mockExternalAPI);
    });

    describe('setResource', () => {
        test('should set resource data with overwrite permission granted', async () => {
            (resourceManager as any).obtainPermissionForOverwrite = jest.fn().mockResolvedValue({
                permission: true,
                state: 'new-state'
            });
            mockExternalAPI.setLastKnownRemoteState = jest.fn();
            mockExternalAPI.setRemoteResourceData = jest.fn();

            const result = await resourceManager.setResource(resourceId, resourceData, true);

            expect(result.signal).toBe('green');
            expect(result.message).toBe('data upload successful');
            expect(mockExternalAPI.setLastKnownRemoteState).toHaveBeenCalledWith(resourceId, 'new-state');
            expect(mockExternalAPI.setRemoteResourceData).toHaveBeenCalledWith(resourceId, { state: 'new-state', data: resourceData });
        });

        test('should not set resource data if overwrite permission is denied', async () => {
            (resourceManager as any).obtainPermissionForOverwrite = jest.fn().mockResolvedValue({
                permission: false
            });

            const result = await resourceManager.setResource(resourceId, resourceData, true);

            expect(result.signal).toBe('yellow');
            expect(result.message).toBe('OVERWRITE_REJECTED. TIMESTAMP_THRESHOLD_NOT_MET');
        });

        test('should set resource data with regular permission granted', async () => {
            (resourceManager as any).obtainPermissionRegular = jest.fn().mockResolvedValue({
                permission: true,
                state: 'new-state'
            });
            mockExternalAPI.setLastKnownRemoteState = jest.fn();
            mockExternalAPI.setRemoteResourceData = jest.fn();

            const result = await resourceManager.setResource(resourceId, resourceData, false);

            expect(result.signal).toBe('green');
            expect(result.message).toBe('data upload successful');
            expect(mockExternalAPI.setLastKnownRemoteState).toHaveBeenCalledWith(resourceId, 'new-state');
            expect(mockExternalAPI.setRemoteResourceData).toHaveBeenCalledWith(resourceId, { state: 'new-state', data: resourceData });
        });

        test('should not set resource data if regular permission is denied', async () => {
            (resourceManager as any).obtainPermissionRegular = jest.fn().mockResolvedValue({
                permission: false
            });

            const result = await resourceManager.setResource(resourceId, resourceData, false);

            expect(result.signal).toBe('red');
            expect(result.message).toBe('WRITE_REJECTED. LOCAL_DATA_INCOMPATIBLE_WITH_SERVER_DATA');
        });

        test('should handle metadata service unavailability', async () => {
            (resourceManager as any).obtainPermissionForOverwrite = jest.fn().mockRejectedValue(new Error('Service unavailable'));

            const result = await resourceManager.setResource(resourceId, resourceData, true);

            expect(result.signal).toBe('yellow');
            expect(result.message).toBe('metadata service unavailable');
        });

        test('should handle data upload failure', async () => {
            (resourceManager as any).obtainPermissionForOverwrite = jest.fn().mockResolvedValue({
                permission: true,
                state: 'new-state'
            });
            mockExternalAPI.setLastKnownRemoteState = jest.fn();
            mockExternalAPI.setRemoteResourceData = jest.fn().mockRejectedValue(new Error('Upload failed'));

            const result = await resourceManager.setResource(resourceId, resourceData, true);

            expect(result.signal).toBe('yellow');
            expect(result.message).toBe('data upload failed');
        });
    });

    describe('getResource', () => {
        test('should get resource data and return sync message', async () => {
            const remoteState = 'current-state';
            const remoteTimestamp = Date.now();

            (mockExternalAPI.runTransaction as jest.Mock).mockImplementation(async (transactionFn: any) => {
                const getRemoteResourceMetadata = jest.fn().mockResolvedValue({
                    remoteResourceState: remoteState,
                    remoteResourceTimestamp: remoteTimestamp
                });

                return transactionFn(getRemoteResourceMetadata);
            });

            mockExternalAPI.getLastKnownRemoteState = jest.fn().mockReturnValue(remoteState);

            const result = await resourceManager.getResource(resourceId);

            expect(result.signal).toBe('green');
            expect(result.message).toBe('data in sync');
        });

        test('should handle metadata service unavailability', async () => {
            (mockExternalAPI.runTransaction as jest.Mock).mockRejectedValue(new Error('Service unavailable'));

            const result = await resourceManager.getResource(resourceId);

            expect(result.signal).toBe('yellow');
            expect(result.message).toBe('metadata service unavailable');
        });

        test('should handle data service unavailability', async () => {
            const remoteState = 'current-state';
            const remoteTimestamp = Date.now();

            (mockExternalAPI.runTransaction as jest.Mock).mockImplementation(async (transactionFn: any) => {
                const getRemoteResourceMetadata = jest.fn().mockResolvedValue({
                    remoteResourceState: remoteState,
                    remoteResourceTimestamp: remoteTimestamp
                });

                return transactionFn(getRemoteResourceMetadata);
            });

            mockExternalAPI.getLastKnownRemoteState = jest.fn().mockReturnValue('outdated-state');
            mockExternalAPI.getRemoteResourceData = jest.fn().mockRejectedValue(new Error('Data service unavailable'));

            const result = await resourceManager.getResource(resourceId);

            expect(result.signal).toBe('yellow');
            expect(result.message).toBe('data service unavailable');
        });

        test('should handle missing data after timestamp threshold', async () => {
            const remoteState = 'current-state';
            const remoteTimestamp = Date.now() - 2 * 60 * 60 * 1000; // 2 hours ago

            (mockExternalAPI.runTransaction as jest.Mock).mockImplementation(async (transactionFn: any) => {
                const getRemoteResourceMetadata = jest.fn().mockResolvedValue({
                    remoteResourceState: remoteState,
                    remoteResourceTimestamp: remoteTimestamp
                });

                return transactionFn(getRemoteResourceMetadata);
            });

            mockExternalAPI.getLastKnownRemoteState = jest.fn().mockReturnValue('outdated-state');
            mockExternalAPI.getRemoteResourceData = jest.fn().mockResolvedValue({
                state: 'other-state',
                data: null
            });

            const result = await resourceManager.getResource(resourceId);

            expect(result.signal).toBe('yellow');
            expect(result.message).toBe("Data can't be found. Consider overwriting");
        });
    });
});
