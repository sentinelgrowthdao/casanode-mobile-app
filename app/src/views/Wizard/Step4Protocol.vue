<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import {
	IonPage, IonContent, IonButton,
	IonGrid, IonRow, IonCol,
	IonList, IonItem,
	IonSelect, IonSelectOption
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useWizardStore } from '@stores/WizardStore';

const wizardStore = useWizardStore();
const router = useRouter();
const vpnType: Ref<string> = ref(wizardStore.vpnType);

const setVpnTypeAndNavigate = () =>
{
	// Check if the node type is wireguard or v2ray
	if(vpnType.value === 'wireguard' || vpnType.value === 'v2ray')
	{
		wizardStore.setVpnType(vpnType.value);
		router.push({ name: 'Wizard5Network' });
	}
};

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
							<ion-select aria-label="protocol" :placeholder="$t('wizard.protocol-placeholder')" v-model="vpnType">
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
				<div class="submit">
					<ion-grid>
						<ion-row>
							<ion-col size="6" offset="6">
								<ion-button expand="block" @click="setVpnTypeAndNavigate">
									{{ $t('wizard.button-next') }}
								</ion-button>
							</ion-col>
						</ion-row>
					</ion-grid>
				</div>
			</div>
		</ion-content>
	</ion-page>
</template>
<style lang="scss" scoped>
@import "@scss/wizard.scss";
</style>