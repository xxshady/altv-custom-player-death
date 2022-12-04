export function shuffleArray(array) {
  let index = array.length
  while (index !== 0) {
    const randomIndex = Math.floor(Math.random() * index)
    --index;
    [array[index], array[randomIndex]] = [
      array[randomIndex], array[index]]
  }
  return array
}
