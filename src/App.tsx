import './App.css'

const PROJECT_ACCESS_KEY = import.meta.env.PROJECT_ACCESS_KEY!
function App() {
  return (
    <>
      <p>demo lootbox</p>
      <p>{PROJECT_ACCESS_KEY && PROJECT_ACCESS_KEY.toString()}</p>
    </>
  )
}

export default App
