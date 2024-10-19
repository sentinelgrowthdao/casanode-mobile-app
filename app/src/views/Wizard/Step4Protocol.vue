<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import {
	IonPage, IonContent,
	IonGrid, IonRow, IonCol,
	IonList, IonItem, IonText,
	IonSelect, IonSelectOption
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useNodeStore } from '@stores/NodeStore';
import NetworkService from '@/services/NetworkService';
import LoadingButton from '@components/LoadingButton.vue';

// Router
const router = useRouter();
// Import the useI18n composable function.
const { t } = useI18n();

const nodeStore = useNodeStore();
const errorMessage: Ref<string> = ref('');
const vpnType: Ref<string> = ref(nodeStore.vpnType);

/**
 * Set the VPN type value and navigate to the next step
 * @returns void
 */
const setVpnTypeAndNavigate = async () =>
{
	// Check if the node type is wireguard or v2ray
	if(vpnType.value === 'wireguard' || vpnType.value === 'v2ray')
	{
		// Set the vpn type value
		const result = await NetworkService.setNodeConfiguration({ vpnType: vpnType.value });
		// Check if the change was successful
		if(result.vpnType)
		{
			nodeStore.setVpnType(vpnType.value);
			router.push({ name: 'Wizard5Network' });
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
						<ion-item lines="none" v-if="errorMessage">
							<ion-text color="danger">{{ errorMessage }}</ion-text>
						</ion-item>
					</ion-list>
				</div>
				<div class="submit">
					<ion-grid>
						<ion-row>
							<ion-col size="6" offset="6">
								<loading-button :label="$t('wizard.button-next')" :callback="setVpnTypeAndNavigate" />
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