import axios from 'axios'

const BASE_URL = 'https://pixabay.com/api/';
const KEY = '39066012-1878526f9ed9fd04be913b678'

export class PixabayApi {
    query = '';
    #per_page = 40;
    page = 1;
  
    async getImages() {
      const PARAMS = new URLSearchParams({
        key: KEY,
        q: this.query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: this.#per_page,
        page: this.page,
      });
  
      const url = `${BASE_URL}?${PARAMS}`;
      const res = await axios.get(url);
      return res.data;
    }
    get perPage() {
      return this.#per_page;
    }
  }