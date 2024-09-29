import assert from "assert";
import { 
  TestHelpers,
  MemeFactory_PoolInitialized
} from "generated";
const { MockDb, MemeFactory } = TestHelpers;

describe("MemeFactory contract PoolInitialized event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for MemeFactory contract PoolInitialized event
  const event = MemeFactory.PoolInitialized.mock({data: {} /* It mocks event fields with default values, so you only need to provide data */});

  it("MemeFactory_PoolInitialized is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await MemeFactory.PoolInitialized.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualMemeFactoryPoolInitialized = mockDbUpdated.entities.MemeFactory_PoolInitialized.get(
      `${event.chainId}_${event.block.height}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedMemeFactoryPoolInitialized: MemeFactory_PoolInitialized = {
      id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualMemeFactoryPoolInitialized, expectedMemeFactoryPoolInitialized, "Actual MemeFactoryPoolInitialized should be the same as the expectedMemeFactoryPoolInitialized");
  });
});
