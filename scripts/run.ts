import * as async from 'async'
import dotenv from 'dotenv'
dotenv.config()
dotenv.config({ path: '.env.local', override: true })

const main = async () => {
  const [, , ...filenames] = process.argv
  const promises = filenames.map(
    (filename: string) => async (callback: any) => {
      console.time(filename)
      const { run } = await import(filename)
      await run()

      console.timeEnd(filename)
      callback(null, null)
    }
  )

  await async.series(promises)
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
