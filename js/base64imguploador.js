export default class UploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }
  upload() {
    return new Promise((resolve, reject) => {
      const reader = this.reader = new window.FileReader();

      reader.addEventListener('load', () => {
        resolve({ default: reader.result });
      });

      reader.addEventListener('error', err => {
        reject(err);
      });

      reader.addEventListener('abort', () => {
        reject();
      });

      this.loader.file.then(file => {
        reader.readAsDataURL(file);
      });
    });
  }
}