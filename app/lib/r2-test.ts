export async function testR2Connection(r2: R2Bucket): Promise<boolean> {
  try {
    const testKey = 'test/connection-check'
    const testData = new TextEncoder().encode('test')
    
    await r2.put(testKey, testData)
    const retrieved = await r2.get(testKey)
    await r2.delete(testKey)
    
    return retrieved !== null
  } catch {
    return false
  }
}