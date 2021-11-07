module.exports = ({ wallets, refs, config, client }) => ({
  getCount: () => client.query("counter", { get_count: {} }),
  increment: (signer = wallets.validator) =>
    client.execute(signer, "counter", { increment: {} }),
});
