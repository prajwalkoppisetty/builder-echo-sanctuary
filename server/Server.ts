import handler from "../dist/server/node-build.mjs";

export default function (req, res) {
  return handler(req, res);
}
