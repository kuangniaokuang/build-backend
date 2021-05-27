module.exports = {
  send: (res, error, code) => {
    console.error(error)
    return res.status(500).send({ error: error.toString(), code })
  }
}
