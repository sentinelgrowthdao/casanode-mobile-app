<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import {
	IonPage, IonContent,
	IonGrid, IonCol, IonRow
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useNodeStore } from '@stores/NodeStore';
import BluetoothService from '@/services/BluetoothService';
import LoadingButton from '@components/LoadingButton.vue';
import CheckMarkCross from '@components/CheckMarkCross.vue';

// Router
const router = useRouter();
// Node store
const nodeStore = useNodeStore();

// Reference to the loading button
const loadingButtonRef = ref<any>(null);
// Node CheckMarkCross
const nodeCheckMarkCross: Ref<string> = ref('');
// VPN CheckMarkCross
const vpnCheckMarkCross: Ref<string> = ref('');
// Test performed
const testPerformed: Ref<boolean> = ref(false);

/**
 * Check the ports and navigate to the next step
 */
const checkPorts = async () =>
{
	// If test already performed, navigate to the next step
	if(testPerformed.value)
	{
		router.push({ name: 'Wizard10Congratulations' });
		return;
	}
	
	// Check node port
	if(await BluetoothService.checkPort('node') === 'open')
		nodeCheckMarkCross.value = 'check';
	else
		nodeCheckMarkCross.value = 'cross';
	
	// If the VPN type is v2ray, check port
	if(nodeStore.vpnType === 'v2ray')
	{
		// Check vpn port
		if(await BluetoothService.checkPort('vpn') === 'open')
			vpnCheckMarkCross.value = 'check';
		else
			vpnCheckMarkCross.value = 'cross';
	}
	
	// Set test performed
	testPerformed.value = true;
};

/**
 * Retry the test
 */
const retryTest = () =>
{
	// Reset the check marks
	nodeCheckMarkCross.value = '';
	vpnCheckMarkCross.value = '';
	testPerformed.value = false;
	
	// Simulate click on the loading button
	if (loadingButtonRef.value)
		loadingButtonRef.value.$el.click();
};

</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.ports-title') }}</h1>
					<p class="text">{{ $t('wizard.ports-text') }}</p>
					<p class="text">{{ $t('wizard.ports-more') }} <a href="https://docs.sentinel.co/node-setup/manual/node-config#enable-port-forwarding-for-residential-nodes" target="_blank" rel="noopener noreferrer">{{ $t('wizard.ports-documentation') }}</a>.</p>
					<div class="port">
						<CheckMarkCross :isCheckMark="nodeCheckMarkCross" />
						<div class="text">
							<p class="label">{{ $t('wizard.ports-node-label') }}</p>
							<p class="value">{{ $t('wizard.ports-node-tcp', {port: nodeStore.nodePort }) }}</p>
						</div>
					</div>
					<div class="port">
						<CheckMarkCross :isCheckMark="vpnCheckMarkCross" />
						<div class="text">
							<p class="label">{{ $t(`wizard.ports-${nodeStore.vpnType}-label`) }}</p>
							<p v-if="nodeStore.vpnType === 'wireguard'" class="value">{{ $t('wizard.ports-node-udp', {port: nodeStore.vpnPort }) }}</p>
							<p v-if="nodeStore.vpnType === 'v2ray'" class="value">{{ $t('wizard.ports-node-tcp', {port: nodeStore.vpnPort }) }}</p>
						</div>
					</div>
					<Transition>
						<div class="retry-block" v-if="testPerformed && (nodeCheckMarkCross === 'cross' || vpnCheckMarkCross === 'cross')">
							<p class="text">{{ $t('wizard.ports-error') }}</p>
							<ion-button size="small" fill="clear" @click="retryTest">{{ $t('wizard.ports-retry') }}</ion-button>
						</div>
					</Transition>
				</div>
				<div class="submit">
					<ion-grid>
						<ion-row>
							<ion-col size="6" offset="6">
								<loading-button ref="loadingButtonRef"
									:label="$t(testPerformed ? 'wizard.button-next' : 'wizard.button-test-ports')"
									:callback="checkPorts" />
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

// <Transition>
.v-enter-active, .v-leave-active
{
	transition: opacity 0.5s ease;
}
.v-enter-active
{
	transition-delay: 1s;
}
.v-enter-from, .v-leave-to
{
	opacity: 0;
}
</style>