const { task, terrajs } = require("@iboss/terrain");

task(async ({ wallets, refs, config, client }) => {
  const count = await client.query("counter", { get_count: {} });
  console.log("prev count = ", count);
  await client.execute(wallets.validator, "counter", {
    increment: {},
  });
  const count2 = await client.query("counter", { get_count: {} });
  console.log("new count = ", count2);
});
