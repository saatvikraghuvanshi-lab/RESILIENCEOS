
/**
 * Simulated Mesh Routing Algorithm (Hop-by-Hop)
 * In a real scenario, this would interface with Web Bluetooth or Native BLE.
 */

export interface MeshPacket {
  id: string;
  originatorId: string;
  payload: any;
  hops: string[];
  ttl: number;
}

export const simulateMeshBroadcast = (packet: MeshPacket, nearbyNodes: string[]): MeshPacket[] => {
  if (packet.ttl <= 0) return [];

  return nearbyNodes.map(nodeId => ({
    ...packet,
    hops: [...packet.hops, nodeId],
    ttl: packet.ttl - 1
  }));
};

/**
 * Logic to determine if a message should be 'stored-and-forwarded'
 */
export const shouldForward = (packet: MeshPacket, nodeId: string): boolean => {
  return !packet.hops.includes(nodeId) && packet.ttl > 0;
};
