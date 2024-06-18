<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import {
	IonPage, IonContent,
	IonGrid, IonRow, IonCol,
	IonList, IonItem, IonText,
	IonInput
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useNodeStore } from '@/stores/NodeStore';
import BluetoothService from '@/services/BluetoothService';
import LoadingButton from '@components/LoadingButton.vue';

// Router
const router = useRouter();
// Import the useI18n composable function.
const { t } = useI18n();

const nodeStore = useNodeStore();
const errorMessage: Ref<string> = ref('');
const nodeIp: Ref<string> = ref(nodeStore.nodeIp);
const nodePort: Ref<string> = ref(nodeStore.nodePort.toString());
const vpnPort: Ref<string> = ref(nodeStore.vpnPort.toString());

const setValuesAndNavigate = async () =>
{
	const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
	const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)|(([0-9a-fA-F]{1,4}:){1,6}:([0-9a-fA-F]{1,4}|:)|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|([0-9a-fA-F]{1,4}:)((:[0-9a-fA-F]{1,4}){1,6})|(:((:[0-9a-fA-F]{1,4}){1,7}|:))))))))$/;
	
	const nodeIpValue: string = nodeIp.value.trim();
	const nodePortValue: number = parseInt(nodePort.value.trim());
	const vpnPortValue: number = parseInt(vpnPort.value.trim());
	
	// Check if the address is valid and ports are between 1024 and 65535
	if ((ipv4Pattern.test(nodeIpValue) || ipv6Pattern.test(nodeIpValue)) &&
		nodePortValue >= 1024 && nodePortValue <= 65535 &&
		vpnPortValue >= 1024 && vpnPortValue <= 65535 &&
		vpnPortValue !== nodePortValue)
	{
		// Send to the server and apply the value
		if(await BluetoothService.writeNodeIp(nodeIpValue)
			&& await BluetoothService.writeNodePort(nodePortValue.toString())
			&& await BluetoothService.writeVpnPort(vpnPortValue.toString())
			&& await BluetoothService.writeNodeConfig())
		{
			nodeStore.setNodeAddress(nodeIpValue);
			nodeStore.setNodePort(nodePortValue);
			nodeStore.setVpnPort(vpnPortValue);
			
			// Check if public address is already exist
			if(nodeStore.publicAddress.length > 0)
			{
				// Skip the wallet configuration
				router.replace({ name: 'Wizard8Fund' });
			}
			else
			{
				// Navigate to the next step
				router.push({ name: 'Wizard6Protection' });
			}
		}
		else
		{
			// Show an error message
			errorMessage.value = t('wizard.error-occurred') as string;
		}
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
							<ion-input :label="$t('wizard.network-public-ip')" v-model="nodeIp" />
						</ion-item>
						<ion-item>
							<ion-input :label="$t('wizard.network-api-port')" v-model="nodePort" />
						</ion-item>
						<ion-item v-if="nodeStore.vpnType === 'wireguard'">
							<ion-input :label="$t('wizard.network-wireguard-port')" v-model="vpnPort" />
						</ion-item>
						<ion-item v-if="nodeStore.vpnType === 'v2ray'">
							<ion-input :label="$t('wizard.network-v2ray-port')" v-model="vpnPort" />
						</ion-item>
						<ion-item lines="none" v-if="errorMessage">
							<ion-text color="danger">{{ errorMessage }}</ion-text>
						</ion-item>
					</ion-list>
				</div>
				<div class="submit">
					<ion-grid>
						<ion-row>
							<ion-col size="6" offset="6">
								<loading-button :label="$t('wizard.button-next')" :callback="setValuesAndNavigate" />
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