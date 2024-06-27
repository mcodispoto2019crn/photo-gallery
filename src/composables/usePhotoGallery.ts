import { ref } from 'vue';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { isPlatform } from '@ionic/vue';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

const printCurrentPosition = async () => {
  const coordinates = await Geolocation.getCurrentPosition();

  console.log('Current position:', coordinates);
  const { latitude, longitude } = coordinates.coords;
  return { latitude, longitude };
};

const photos = ref<UserPhoto[]>([]);
const PHOTO_STORAGE = 'photos';

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
  ubication:{
    latitude:number,
    longitude:number
  };
}

export const usePhotoGallery = () => {
  const takePhoto = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });
    const fileName:string = Date.now() + '.jpeg' as string;
    const coordinates = await printCurrentPosition();
    photo.ubication = coordinates;
    const savedFileImage = await savePicture(photo, fileName);
    console.log('PHOTO', photo);
    photos.value = [savedFileImage, ...photos.value];
  };

  return {
    photos,
    takePhoto,
    deletePhoto
  };
};

const convertBlobToBase64 = (blob: Blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

const savePicture = async (photo: Photo, fileName: string): Promise<UserPhoto> => {
  // // Fetch the photo, read as a blob, then convert to base64 format
  // const response = await fetch(photo.webPath!);
  // const blob = await response.blob();
  // const base64Data = (await convertBlobToBase64(blob)) as string;

  // // Use webPath to display the new image instead of base64 since it's
  // // already loaded into memory
  // return {
  //   filepath: fileName,
  //   webviewPath: photo.webPath,
  // };

  let base64Data: string | Blob;
  // "hybrid" will detect mobile - iOS or Android
  if (isPlatform('hybrid')) {
    const file = await Filesystem.readFile({
      path: photo.path!,
    });
    base64Data = file.data;
  } else {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();
    base64Data = (await convertBlobToBase64(blob)) as string;
  }
  const savedFile = await Filesystem.writeFile({
    path: fileName,
    data: base64Data,
    directory: Directory.Data
  });

  if (isPlatform('hybrid')) {
    // Display the new image by rewriting the 'file://' path to HTTP
    // Details: https://ionicframework.com/docs/building/webview#file-protocol
    return {
      filepath: savedFile.uri,
      webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      ubication: photo.ubication
    };
  } else {
    // Use webPath to display the new image instead of base64 since it's
    // already loaded into memory
    return {
      filepath: fileName,
      webviewPath: photo.webPath,
      ubication: photo.ubication
    };
  }
};  

export const saveCachePhotos = () => {
  Preferences.set({
    key: PHOTO_STORAGE,
    value: JSON.stringify(photos.value),
  });
};

// export const removeCachePhotos = (photoRemoved:UserPhoto) => {
//   photos.value = photos.value.filter(photo => photo.filepath !== photoRemoved.filepath);
//   saveCachePhotos()
// };

const deletePhoto = async (photo: UserPhoto) => {
  // Remove this photo from the Photos reference data array
  photos.value = photos.value.filter((p) => p.filepath !== photo.filepath);

  // delete photo file from filesystem
  const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
  await Filesystem.deleteFile({
    path: filename,
    directory: Directory.Data,
  });
};

export const loadSaved = async () => {
  // const photoList = await Preferences.get({ key: PHOTO_STORAGE });
  // const photosInPreferences = photoList.value ? JSON.parse(photoList.value) : [];

  // for (const photo of photosInPreferences) {
  //   const file = await Filesystem.readFile({
  //     path: photo.filepath,
  //     directory: Directory.Data,
  //   });
  //   photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
  // }

  // photos.value = photosInPreferences;
  const photoList = await Preferences.get({ key: PHOTO_STORAGE });
  const photosInPreferences = photoList.value ? JSON.parse(photoList.value) : [];

  // If running on the web...
  if (!isPlatform('hybrid')) {
    for (const photo of photosInPreferences) {
      const file = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data,
      });
      // Web platform only: Load the photo as base64 data
      photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
    }
  }

  photos.value = photosInPreferences;
};

