<script lang="ts" setup>
import { IonPage, IonContent, IonButton, IonList, IonItem, IonSelect, IonSelectOption } from '@ionic/vue';
</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.protocol-title') }}</h1>
					<p class="text">{{ $t('wizard.protocol-text') }}</p>
					<ul>
						<li>
							<strong>{{ $t('wizard.protocol-wireguard') }}</strong>
							{{ $t('wizard.protocol-wireguard-desc') }}
						</li>
						<li>
							<strong>{{ $t('wizard.protocol-v2ray') }}</strong>
							{{ $t('wizard.protocol-v2ray-desc') }}
						</li>
					</ul>
					<ion-list class="input">
						<ion-item>
							<ion-select aria-label="protocol" :placeholder="$t('wizard.protocol-placeholder')" value="">
								<ion-select-option value="wireguard">
									{{ $t('wizard.protocol-wireguard') }}
								</ion-select-option>
								<ion-select-option value="v2ray">
									{{ $t('wizard.protocol-v2ray') }}
								</ion-select-option>
							</ion-select>
						</ion-item>
					</ion-list>
				</div>
				<div class="submit right">
					<ion-button :router-link="{ name: 'Wizard5Network' }" router-direction="forward">
						{{ $t('wizard.button-next') }}
					</ion-button>
				</div>
			</div>
		</ion-content>
	</ion-page>
</template>
<style lang="scss" scoped>
@import "@scss/wizard.scss";
</style>