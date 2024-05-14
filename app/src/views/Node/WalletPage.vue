<script lang="ts" setup>
import { ref } from 'vue';
import {
	IonPage, IonContent, IonHeader,
	IonCard, IonCardHeader, IonCardTitle, IonCardContent,
	IonButton, IonIcon, IonGrid, IonRow, IonCol, IonItem, IonLabel
} from '@ionic/vue';
import { refresh, link, copy } from 'ionicons/icons';
import AppToolbar from '@/components/AppToolbar.vue';

// Example of transactions
const transactions = ref([
	{ type: 'update-status', amount: '-0.009535 DVPN', id: '3C83865A9A6...' },
	{ type: 'update-status', amount: '-0.01 DVPN', id: '3C83865A9A6...' },
	{ type: 'update-status', amount: '-0.009645 DVPN', id: '3C83865A9A6...' },
	{ type: 'update-status', amount: '-0.01 DVPN', id: '3C83865A9A6...' },
	{ type: 'update-details', amount: '-0.009542 DVPN', id: '3C83865A9A6...' },
	{ type: 'update-status', amount: '-0.009531 DVPN', id: '3C83865A9A6...' },
	{ type: 'update-status', amount: '-0.009742 DVPN', id: '3C83865A9A6...' },
	{ type: 'update-details', amount: '-0.009804 DVPN', id: '3C83865A9A6...' },
	{ type: 'receive', amount: '+50 DVPN', id: '3C83865A9A6...' }
]);
</script>
<template>
	<ion-page>
		<ion-header>
			<app-toolbar />
		</ion-header>
		<ion-content>
			<div class="wallet">
				<!-- Node Balance -->
				<ion-card class="container bg-blue">
					<ion-card-content>
						<ion-grid>
							<ion-row>
								<ion-col size="8">
									<p class="label">{{ $t('wallet.node-balance-label') }}</p>
									<p class="value">1,432.45 DVPN</p>
								</ion-col>
								<ion-col size="4">
									<ion-button fill="clear">
										<ion-icon :icon="refresh"></ion-icon>
									</ion-button>
								</ion-col>
							</ion-row>
						</ion-grid>
					</ion-card-content>
				</ion-card>

				<!-- Public and Node Address -->
				<ion-card class="container">
					<ion-card-content>
						<p class="item">
							<strong>{{ $t('wallet.public-address-label') }}</strong>
							<span class="value">sent1gml0h2eavhrqcwz8u5h0s8f8mds67f0gvtmsnw</span>
							<ion-button fill="clear" size="small">
								<ion-icon :icon="copy"></ion-icon>
							</ion-button>
						</p>
						<p class="item">
							<strong>{{ $t('wallet.node-address-label') }}</strong>
							<span class="value">sentnode1gml0h2eavhrqcwz8u5h0s8f8mds67f0g6a6fkc</span>
							<ion-button fill="clear" size="small">
								<ion-icon :icon="copy"></ion-icon>
							</ion-button>
						</p>
					</ion-card-content>
				</ion-card>

				<!-- Latest Transactions -->
				<ion-card class="container">
					<ion-card-header>
						<ion-card-title>{{ $t('wallet.latest-transactions-label') }}</ion-card-title>
					</ion-card-header>
					<ion-card-content>
						<ion-item v-for="(transaction, index) in transactions" :key="index" lines="none">
							<ion-label>{{ $t(`wallet.${transaction.type}-label`) }}</ion-label>
							<div class="transaction-details">
								<span>{{ transaction.amount }}</span>
								<span>{{ transaction.id }}</span>
								<ion-button fill="clear" size="large">
									<ion-icon :icon="link"></ion-icon>
								</ion-button>
							</div>
						</ion-item>
					</ion-card-content>
				</ion-card>

				<!-- Delete Wallet -->
				<ion-card class="container nobg">
					<ion-card-content>
						<ion-button color="danger" fill="outline" expand="block">
							{{ $t('wallet.delete-wallet-label') }}
						</ion-button>
					</ion-card-content>
				</ion-card>
			</div>
		</ion-content>
	</ion-page>
</template>

<style lang="scss" scoped>
@import "@scss/container.scss";

.transaction-details
{
	display: flex;
	align-items: center;

	&>span
	{
		margin-right: 10px;
	}
}
</style>
