export default async ({ wallets, refs, config, client }) => ({
  getCount: () => client.query("counter", { get_count: {} }),
  increment: () =>
    client.execute(wallets.validator, "counter", { increment: {} }),
});
