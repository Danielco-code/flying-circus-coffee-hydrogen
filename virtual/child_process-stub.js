export const execFile = () => {
  throw new Error("node:child_process is not available in Oxygen runtime");
};
export default { execFile };
