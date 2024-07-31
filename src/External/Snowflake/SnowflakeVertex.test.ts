import SnowflakeVertex from './SnowflakeVertex';

describe('SnowflakeVertex', () => {
  describe('sync', () => {
    it('should sync state of an existing resource between parent and child vertices', async () => {
      // Arrange
      const externalAPI = {
        getParentNodes: jest.fn().mockResolvedValue(
          {
            states: { "parent_resource1": 'state1' },
            metadata: { "parent_resource1": { type: "default", payload: null } }
          },
        ),
        setParentNodes: jest.fn(),
      };
      const content = {
        nodes: {
          states: { "child_resource1": 'state2' },
          metadata: { "child_resource1": { type: "default", payload: null } }
        },
        edges: { "child_resource1->parent_resource1": "state1" },
      };
      const vertex = new SnowflakeVertex(externalAPI, "child", "parent", content);

      // Act
      const result = await vertex.sync();

      // Assert
      expect(externalAPI.getParentNodes).toHaveBeenCalled();
      //console.log(externalAPI.setParentNodes.mock.calls)
      expect(externalAPI.setParentNodes).toHaveBeenCalledWith(
        {
          states: {"parent_resource1": 'state2'},
          metadata: {"parent_resource1": { type: "default", payload: null }},
        },
      );
      expect(result).toEqual(true);

    });

    it('should sync state of an resource that was newly created at child', async () => {
      // Arrange
      const externalAPI = {
        getParentNodes: jest.fn().mockResolvedValue(
          {
            states: {},
            metadata: {},
          },
        ),
        setParentNodes: jest.fn(),
      };
      const vertex = new SnowflakeVertex(externalAPI, "child", "parent", undefined);
      vertex.createResource("resource1",{ type: "default", payload: null });

      // Act
      const result = await vertex.sync();

      // Assert
      expect(externalAPI.getParentNodes).toHaveBeenCalled();
      expect(externalAPI.setParentNodes).toHaveBeenCalled();
      expect(Object.keys(vertex.content.edges).length).toEqual(1);
      expect(result).toEqual(true);
    });

    it('should sync resource that was deleted at child', async () => {
      // Arrange
      // Arrange
      const externalAPI = {
        getParentNodes: jest.fn().mockResolvedValue(
          { 
            states: {"parent_resource1": 'state1'} ,
            metadata: {"parent_resource1": { type: "default", payload: null }}
        },
        ),
        setParentNodes: jest.fn(),
      };
      const content = {
        nodes: { 
          states: {"child_resource1": 'state2'},
          metadata: {"child_resource1": { type: "default", payload: null }},
        },
        edges: { "child_resource1->parent_resource1": "state1" },
      };
      const vertex = new SnowflakeVertex(externalAPI, "child", "parent", content);
      vertex.deleteResource("resource1");
      // Act
      const result = await vertex.sync();

      // Assert
      expect(externalAPI.getParentNodes).toHaveBeenCalled();
      //console.log(externalAPI.setParentNodes.mock.calls)
      expect(externalAPI.setParentNodes).toHaveBeenCalledWith(
        {
          states: {},
          metadata: {}
        },
      );
      expect(vertex.content.nodes).toEqual({
        states: {},
        metadata: {},
      });
      expect(vertex.content.edges).toEqual({});
      expect(result).toEqual(true);
    });

    it('should handle errors and return status false', async () => {
      // Arrange
      const externalAPI = {
        getParentNodes: jest.fn().mockRejectedValue(new Error('API error')),
        setParentNodes: jest.fn(),
      };
      const content = {
        nodes: {
          states: {},
          metadata: {},
        },
        edges: {},
        resources: [],
      };
      const vertex = new SnowflakeVertex(externalAPI, "child", "parent", content);

      // Act
      const result = await vertex.sync();

      // Assert
      expect(externalAPI.getParentNodes).toHaveBeenCalled();
      expect(result).toEqual(false);
    });
  });

  it('should serialize and deserialize vertex correctly', () => {
    // Arrange
    const externalAPI = {
      getParentNodes: jest.fn(),
      setParentNodes: jest.fn(),
    };
    const content = {
      nodes: { 
        states: {"resource1": 'state1' },
        metadata: {"resource1": { type: "default", payload: null }},
      },
      edges: { "resource1->parent_resource1": "state1" },
    };
    const vertex = new SnowflakeVertex(externalAPI, "child", "parent", content);

    // Act
    const serializedVertex = vertex.serializeVertex();
    const deserializedVertex = SnowflakeVertex.deserializeVertex(serializedVertex, externalAPI);

    // Assert
    expect(deserializedVertex).toEqual(vertex);
  })
});