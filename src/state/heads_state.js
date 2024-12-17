let heads = [];

export function addHead(name, status) {
  heads.push({ name, status, createdAt: Date.now() });
}

export function getHeads() {
  return heads;
}
