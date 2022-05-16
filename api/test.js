export default function(_req, res) {
    res.status(200).send(process.env.TEST_ENV_VAR)
}