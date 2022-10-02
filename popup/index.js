let activeTab = 'youtube';
let tabLabels = { youtube: 'YouTube' };

const changeActiveTab = (e) => {
  const tab_id = e.target.id;

  const oldActive = document.getElementById(activeTab);
  const newActive = document.getElementById(tab_id);
  const label = document.getElementById('input-label');

  oldActive.classList.remove('button-active');
  newActive.classList.add('button-active');

  label.innerHTML = tabLabels[tab_id];

  activeTab = tab_id;
};

const handleExtract = async (e) => {
  let windowTabs;
  try {
    windowTabs = await browser.tabs.query({
      currentWindow: true,
      active: true,
    });
  } catch (e) {
    windowTabs = await chrome.tabs.query({
      active: true,
    });
  }

  const server = document.querySelector('#database').value;
  const translationLanguage = document.querySelector('#translation').value;
  const videoLanguage = document.querySelector('#video-language').value;

  const url = windowTabs.length > 0 ? windowTabs[0].url : '';

  switch (activeTab) {
    case 'youtube':
      if (checkYoutubeValidity(url)) {
        postYoutubeIDToBackend(url, server, videoLanguage, translationLanguage);
      } else {
        showAlert('You are not on a YouTube video!');
      }
      break;
    case 'ntulearn':

    default:
      console.log('extractType not recognised!');
  }
};

const checkYoutubeValidity = (url) => {
  const re =
    /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;
  const res = url.match(re);
  if (!res || !res[5]) return null;
  return res;
};

const showAlert = (message, success) => {
  const alert = document.getElementById('alert');
  alert.classList.remove('hidden');
  alert.innerHTML = message;
  if (success) {
    alert.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
  } else {
    alert.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
  }

  window.setTimeout(() => {
    alert.classList.add('hidden');
  }, 3000);
};

const postYoutubeIDToBackend = async (
  youtubeURL,
  server,
  videoLanguage,
  translateLanguage
) => {
  let url = '';
  console.log(translation);
  if (server === 'cloud') {
    url = ' https://ayaka-apps.shn.hk/bytevid';
  } else {
    url = 'http://localhost:5000';
  }
  frontendURL = 'http://localhost:3000';

  try {
    const formData = new FormData();
    formData.append('type', 'youtube');
    formData.append('url', youtubeURL);
    formData.append('videoLanguage', videoLanguage);
    formData.append('translateLanguage', translateLanguage);
    formData.append('server', server);
    const response = await fetch(url + '/video', {
      method: 'POST',
      body: formData,
    });
    const uuid = await response.text();
    showAlert('Successfully submitted!', true);

    const resultContainer = document.querySelector('#result-url');
    resultContainer.classList.remove('hidden');
    resultContainer.innerHTML = `<a href="${frontendURL}/result/${uuid}" target="_blank">Visit Result Page</a>`;
  } catch (error) {
    console.log(error);
    showAlert('Error submitting url!');
  }
};

document
  .querySelectorAll('.button')
  .forEach((btn) => btn.addEventListener('click', changeActiveTab));

document
  .querySelector('.submit-button')
  .addEventListener('click', handleExtract);
