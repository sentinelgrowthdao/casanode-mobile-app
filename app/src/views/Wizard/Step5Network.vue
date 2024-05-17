<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import {
	IonPage, IonContent, IonButton,
	IonGrid, IonRow, IonCol,
	IonList, IonItem,
	IonInput
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useWizardStore } from '@stores/WizardStore';

const wizardStore = useWizardStore();
const router = useRouter();
const ipAddress: Ref<string> = ref('');
const nodePort: Ref<string> = ref(wizardStore.nodePort.toString());
const vpnPort: Ref<string> = ref(wizardStore.vpnPort.toString());

const setValuesAndNavigate = () =>
{
	const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
	const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)|(([0-9a-fA-F]{1,4}:){1,6}:([0-9a-fA-F]{1,4}|:)|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|([0-9a-fA-F]{1,4}:)((:[0-9a-fA-F]{1,4}){1,6})|(:((:[0-9a-fA-F]{1,4}){1,7}|:))))))))$/;
	
	const ipAddressValue: string = ipAddress.value.trim();
	const nodePortValue: number = parseInt(nodePort.value.trim());
	const vpnPortValue: number = parseInt(vpnPort.value.trim());
	
	// Check if the address is valid and ports are between 1024 and 65535
	if ((ipv4Pattern.test(ipAddressValue) || ipv6Pattern.test(ipAddressValue)) &&
		nodePortValue >= 1024 && nodePortValue <= 65535 &&
		vpnPortValue >= 1024 && vpnPortValue <= 65535 &&
		vpnPortValue !== nodePortValue)
	{
		wizardStore.setMoniker(ipAddressValue);
		wizardStore.setNodePort(nodePortValue);
		wizardStore.setVpnPort(vpnPortValue);
		router.push({ name: 'Wizard6Protection' });
	}
};

</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.network-title') }}</h1>
					<p class="text">{{ $t('wizard.network-text') }}</p>
					<ion-list class="input">
						<ion-item>
							<ion-input :label="$t('wizard.network-public-ip')" v-model="ipAddress" />
						</ion-item>
						<ion-item>
							<ion-input :label="$t('wizard.network-api-port')" v-model="nodePort" />
						</ion-item>
						<ion-item v-if="wizardStore.vpnType === 'wireguard'">
							<ion-input :label="$t('wizard.network-wireguard-port')" v-model="vpnPort" />
						</ion-item>
						<ion-item v-if="wizardStore.vpnType === 'v2ray'">
							<ion-input :label="$t('wizard.network-v2ray-port')" v-model="vpnPort" />
						</ion-item>
					</ion-list>
				</div>
				<div class="submit">
					<ion-grid>
						<ion-row>
							<ion-col size="6" offset="6">
								<ion-button expand="block" v-on:click="setValuesAndNavigate">
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