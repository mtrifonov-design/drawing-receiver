import SnowflakeResourceManager from './SnowflakeResourceManager';
import { MetadataServer, DataServer, EditorInstance } from './MockTextEditor'; // Adjust the path accordingly

describe('EditorInstance', () => {
    let metadataServer: MetadataServer;
    let dataServer: DataServer;
    let editor1: EditorInstance;
    let editor2: EditorInstance;
    const resourceId = 'test-resource';

    beforeEach(() => {
        metadataServer = new MetadataServer();
        dataServer = new DataServer();
        editor1 = new EditorInstance(metadataServer, dataServer);
        editor2 = new EditorInstance(metadataServer, dataServer);
    });

    test('should create a new resource', () => {
        editor1.create(resourceId, 'Initial text');
        expect(editor1.get(resourceId)).toBe('Initial text');
    });

    test('should throw an error if creating an existing resource', () => {
        editor1.create(resourceId, 'Initial text');
        expect(() => editor1.create(resourceId, 'New text')).toThrow('Resource already exists');
    });

    test('should edit an existing resource', () => {
        editor1.create(resourceId, 'Initial text');
        editor1.edit(resourceId, 'Updated text');
        expect(editor1.get(resourceId)).toBe('Updated text');
    });

    test('should throw an error if editing a non-loaded resource', () => {
        expect(() => editor1.edit(resourceId, 'Updated text')).toThrow('Not loaded');
    });

    test('should delete an existing resource that was never synced', () => {
        editor1.create(resourceId, 'Initial text');
        editor1.delete(resourceId);
        expect(editor1.get(resourceId)).toBe(undefined);
    });

    test('should sync an edited resource', async () => {
        editor1.create(resourceId, 'Initial text');
        editor1.edit(resourceId, 'Updated text');
        const signal = await editor1.sync(resourceId);
        expect(signal).toBe('green');
        expect(editor1.get(resourceId)).toBe('Updated text');
    });

    test('should sync a deleted resource', async () => {
        editor1.create(resourceId, 'Initial text');
        editor1.delete(resourceId);
        const signal = await editor1.sync(resourceId);
        expect(signal).toBe('green');
        expect(editor1.get(resourceId)).toBe(undefined);
    });

    test('should sync doc created on client 1 to client 2', async () => {
        editor1.create(resourceId, 'Initial text');
        const signal = await editor1.sync(resourceId);
        expect(signal).toBe('green');

        await editor2.sync(resourceId); // Sync editor2 to the initial state
        expect(editor2.get(resourceId)).toBe('Initial text');
    });

    test('should handle conflicting edits between editors', async () => {
        editor1.create(resourceId, 'Initial text');
        await editor1.sync(resourceId);

        await editor2.sync(resourceId); // Sync editor2 to the initial state
        expect(editor2.get(resourceId)).toBe('Initial text');

        editor1.edit(resourceId, 'Editor1 text');
        editor2.edit(resourceId, 'Editor2 text');

        await editor1.sync(resourceId);
        const signal = await editor2.sync(resourceId);

        expect(signal).toBe('red');
    });

    test('should handle metadata server unresponsiveness', async () => {
        editor1.create(resourceId, 'Initial text');
        await editor1.sync(resourceId);

        // Set editor2 to unresponsive
        editor2.setUnresponsive("metadataServer");

        let signal = await editor2.sync(resourceId);
        expect(signal).toBe('yellow');

        // Set editor2 to responsive
        editor2.setResponsive("metadataServer");
        signal = await editor2.sync(resourceId);
        expect(signal).toBe('green');
        expect(editor2.get(resourceId)).toBe('Initial text');
    });

    test('should handle data service unavailability', async () => {
        editor1.create(resourceId, 'Initial text');
        await editor1.sync(resourceId);

        // Set editor2 to unresponsive
        editor2.setUnresponsive("dataServer");

        let signal = await editor2.sync(resourceId);
        expect(signal).toBe('yellow');
        expect(() => editor2.get(resourceId)).toThrow('Not loaded');

        // Set editor2 to responsive
        editor2.setResponsive("dataServer");
        signal = await editor2.sync(resourceId);
        expect(signal).toBe('green');
        expect(editor2.get(resourceId)).toBe('Initial text');
    });
});
