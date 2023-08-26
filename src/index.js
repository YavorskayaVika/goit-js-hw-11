import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { PixabayApi } from './pixabayApi';

const refs = {
  formElem: document.querySelector('.search-form'),
  inputElem: document.querySelector("input[name='searchQuery']"),
  submitBtn: document.querySelector("button[type='submit']"),
  btnLoadMore: document.querySelector('.load-more'),
  galleryList: document.querySelector('.gallery'),
};

const pixabayApi = new PixabayApi();
let maxPage = 1;

refs.formElem.addEventListener('submit', onFormSubmit);
refs.btnLoadMore.addEventListener('click', onLoadMore);
refs.btnLoadMore.classList.add('visually-hidden');


async function onFormSubmit(e) {
  e.preventDefault();
  window.scrollTo({ top: 0 });
  const query = refs.inputElem.value.trim();
  pixabayApi.query = query;
  pixabayApi.page = 1;

  try {
    const data = await pixabayApi.getImages();
    maxPage = Math.ceil(data.totalHits / pixabayApi.per_page);
    refs.galleryList.innerHTML = '';
    renderImages(data.hits);
    lightbox.refresh();

    if (query.trim() === '' && data.totalHits > 0) {
      errorShow();
      refs.galleryList.innerHTML = '';
      refs.btnLoadMore.classList.add('visually-hidden');
      refs.formElem.reset();
    }

    if (data.totalHits > 0 && query.trim() !== '') {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`, {
        timeout: 3000,
      });

      if (data.totalHits < 40) {
        refs.btnLoadMore.classList.add('visually-hidden');
      } else {
        refs.btnLoadMore.classList.remove('visually-hidden');
      }
    }

    if (data.totalHits === 0) {
      errorShow();
    }

    updateStatusBtn();
  } catch (error) {
    console.log(error);
  }
}

function updateStatusBtn() {
  if (pixabayApi.page === maxPage) {
    refs.btnLoadMore.classList.add('visually-hidden');
    Notiflix.Notify.info(
      `We're sorry, but you've reached the end of search results.`,
      { position: 'right-bottom', timeout: 4000 }
    );
  }
}

async function onLoadMore(e) {
  pixabayApi.page += 1;

  try {
    const data = await pixabayApi.getImages();
    renderImages(data.hits);
    lightbox.refresh();
    refs.btnLoadMore.disabled = false;

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    updateStatusBtn();
  } catch (error) {
    console.log(error);
  }
}

function templateImageCard({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
    <div class="photo-card">
    <a class="gallery__link" href="${largeImageURL}">
    <img class="image-item" src="${webformatURL}" alt="${tags}" width="340px" height="220px" loading="lazy"/>
    </a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>${likes}
    </p>
    <p class="info-item">
      <b>Views</b>${views}
    </p>
    <p class="info-item">
      <b>Comments</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>${downloads}
    </p>
  </div>
</div>`;
}

function renderImages(images) {
  const markup = images.map(templateImageCard).join('');
  refs.galleryList.insertAdjacentHTML('beforeend', markup);
}

function errorShow() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.',
    { timeout: 3500 }
  );
}

let lightbox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});