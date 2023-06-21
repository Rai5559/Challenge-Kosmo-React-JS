//function to fetch random photo from jsonplaceholder and return url
function randomFetch() {
  const url = "https://jsonplaceholder.typicode.com/photos";
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const randomIdx = Math.floor(Math.random() * data.length);
      const randomPhoto = data[randomIdx];
      return randomPhoto.url;
    })
    .catch((error) => console.log(error));
}
//function to save url to state
async function saveUrl() {
  const url = await randomFetch();
  return url;
}

export default saveUrl;
