<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
       
        <ion-title><ion-icon :icon="imagesOutline"></ion-icon> Photo Gallery</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 2</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-grid>
        <ion-row>
          <ion-col size="6" :key="photo.filepath" v-for="photo in photos">
            <ion-img  :src="photo.webviewPath" class="img-gallery" @click="showActionSheet(photo)"></ion-img>
            <!-- <ion-button @click="removeCachePhotos(photo)">
              <ion-icon slot="icon-only" :icon="trash"></ion-icon>
            </ion-button> -->
          </ion-col>
        </ion-row>
      </ion-grid>
      <ion-fab vertical="bottom" horizontal="center" slot="fixed">
        <ion-fab-button @click="takePhoto()">
          <ion-icon :icon="camera"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>
 
<script setup lang="ts">
import { onMounted, watch } from 'vue';
import {
  actionSheetController,
  IonPage,
  IonHeader,
  IonFab,
  IonFabButton,
  IonIcon,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  // IonButton
} from '@ionic/vue';
import { usePhotoGallery , UserPhoto, saveCachePhotos, loadSaved,
  // removeCachePhotos
 } from '@/composables/usePhotoGallery';
import { imagesOutline, camera, trash, close} from 'ionicons/icons';
 
const { photos , takePhoto, deletePhoto  } = usePhotoGallery();
watch(photos, saveCachePhotos);
onMounted(() => {
  loadSaved();
});
 
const showActionSheet = async (photo: UserPhoto) => {
  const actionSheet = await actionSheetController.create({
    header: 'Foto hecha en: '+photo.ubication.address,
    buttons: [
      {
        text: 'Delete',
        role: 'destructive',
        icon: trash,
        handler: () => {
          deletePhoto(photo);
        },
      },
      {
        text: 'Cancel',
        icon: close,
        role: 'cancel',
        handler: () => {
          // Nothing to do, action sheet is automatically closed
        },
      },
    ],
  });
  await actionSheet.present();
};
</script>
<style scoped>
.img-gallery::part(image){
  border-radius: 8px;
}
ion-button{
  position: absolute;
  bottom: 4px;
  --background: none;
  --box-shadow: none;
}
</style>