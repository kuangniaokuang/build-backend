function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const func1 = async () => {
  await sleep(3000)
  console.log('func1')
}

const func2 = async () => {
  console.log('func2')
}

(async () => {
  func1()
  func2()
})()
