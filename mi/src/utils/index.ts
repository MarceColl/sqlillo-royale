/**
 * Asynchronously wait for a given time.
 * @returns {Promise<void>}
 */
const wait = async (t: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
};

export { wait };
