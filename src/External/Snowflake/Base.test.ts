import { syncNodes, generateID, updateNode, deleteNode, NodeMap, EdgeMap } from './Base';

describe('syncNodes', () => {
  let nodes: NodeMap;
  let edges: EdgeMap;

  beforeEach(() => {
    nodes = {};
    edges = {};
  });

  it('should sync nodes and edges correctly when nodeB is tainted', () => {
    const nodeA_id = 'nodeA';
    const nodeB_id = 'nodeB';

    nodes[nodeA_id] = 'stateA';
    nodes[nodeB_id] = 'stateB';
    edges[`${nodeA_id}->${nodeB_id}`] = 'stateA';

    syncNodes(nodes, edges, nodeA_id, nodeB_id);

    expect(nodes[nodeA_id]).toBe('stateB');
    expect(edges[`${nodeA_id}->${nodeB_id}`]).toBe('stateB');
  });

  it('should sync nodes and edges correctly when nodeA is tainted', () => {
    const nodeA_id = 'nodeA';
    const nodeB_id = 'nodeB';

    nodes[nodeA_id] = 'stateA';
    nodes[nodeB_id] = 'stateB';
    edges[`${nodeA_id}->${nodeB_id}`] = 'stateB';

    syncNodes(nodes, edges, nodeA_id, nodeB_id);

    expect(nodes[nodeB_id]).toBe('stateA');
    expect(edges[`${nodeA_id}->${nodeB_id}`]).toBe('stateA');
  });

  it('should not sync nodes and edges when neither nodeA nor nodeB is tainted', () => {
    const nodeA_id = 'nodeA';
    const nodeB_id = 'nodeB';

    nodes[nodeA_id] = 'stateC';
    nodes[nodeB_id] = 'stateC';
    edges[`${nodeA_id}->${nodeB_id}`] = 'stateC';

    syncNodes(nodes, edges, nodeA_id, nodeB_id);

    expect(nodes[nodeA_id]).toBe('stateC');
    expect(nodes[nodeB_id]).toBe('stateC');
    expect(edges[`${nodeA_id}->${nodeB_id}`]).toBe('stateC');
  });

  it('should allow creation of new nodes upwards', () => {
    const nodeA_id = 'nodeA';
    const nodeB_id = 'nodeB';
    nodes[nodeA_id] = 'stateA';


    syncNodes(nodes, edges, nodeA_id, nodeB_id);

    expect(nodes[nodeA_id]).toBe('stateA');
    expect(nodes[nodeB_id]).toBe('stateA');
    expect(edges[`${nodeA_id}->${nodeB_id}`]).toBe('stateA');
  });

  it('should allow creation of new nodes downwards', () => {
    const nodeA_id = 'nodeA';
    const nodeB_id = 'nodeB';
    nodes[nodeB_id] = 'stateB';


    syncNodes(nodes, edges, nodeA_id, nodeB_id);

    expect(nodes[nodeA_id]).toBe('stateB');
    expect(nodes[nodeB_id]).toBe('stateB');
    expect(edges[`${nodeA_id}->${nodeB_id}`]).toBe('stateB');
  });

  it('should allow deletion of nodes upwards', () => {
    const nodeA_id = 'nodeA';
    const nodeB_id = 'nodeB';

    edges[`${nodeA_id}->${nodeB_id}`] = 'stateB';
    nodes[nodeB_id] = 'stateB';


    syncNodes(nodes, edges, nodeA_id, nodeB_id);

    expect(nodes[nodeA_id]).toBe(undefined);
    expect(nodes[nodeB_id]).toBe(undefined);
    expect(edges[`${nodeA_id}->${nodeB_id}`]).toBe(undefined);
  });

  it('should allow deletion of nodes downwards', () => {
    const nodeA_id = 'nodeA';
    const nodeB_id = 'nodeB';

    edges[`${nodeA_id}->${nodeB_id}`] = 'stateA';
    nodes[nodeA_id] = 'stateA';


    syncNodes(nodes, edges, nodeA_id, nodeB_id);

    expect(nodes[nodeA_id]).toBe(undefined);
    expect(nodes[nodeB_id]).toBe(undefined);
    expect(edges[`${nodeA_id}->${nodeB_id}`]).toBe(undefined);
  });

});

describe('generateID', () => {
  it('should generate a unique ID', () => {
    const id1 = generateID();
    const id2 = generateID();

    expect(id1).not.toBe(id2);
  });
});

describe('updateNode', () => {
  it('should update the node with a new ID', () => {
    const nodes: NodeMap = {};
    const node_id = 'node1';

    updateNode(nodes, node_id);

    expect(nodes[node_id]).toBeDefined();
  });
});

describe('deleteNode', () => {
  it('should delete the node from the nodes map', () => {
    const nodes: NodeMap = {};
    const node_id = 'node1';

    nodes[node_id] = 'state1';

    deleteNode(nodes, node_id);

    expect(nodes[node_id]).toBeUndefined();
  });
});