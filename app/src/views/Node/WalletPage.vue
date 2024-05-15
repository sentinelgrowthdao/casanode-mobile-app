<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import {
	IonPage, IonContent, IonHeader,
	IonCard, IonCardHeader, IonCardTitle, IonCardContent,
	IonButton, IonIcon, IonGrid, IonRow, IonCol, IonItem, IonLabel
} from '@ionic/vue';
import { refresh, link, copy } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import AppToolbar from '@/components/AppToolbar.vue';
import { copyToClipboard } from '@/utils/clipboard';

// Import the useI18n composable function.
const { t } = useI18n();

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

// Public and Node Address
const address_public: Ref<string> = ref('sent1gml0h2eavhrqcwz8u5h0s8f8mds67f0gvtmsnw')
const address_node: Ref<string> = ref('sentnode1gml0h2eavhrqcwz8u5h0s8f8mds67f0g6a6fkc')

</script>
<template>
	<ion-page>
		<ion-header>
			<app-toolbar />
		</ion-header>
		<ion-content>
			<div class="wallet">
				<!-- Node Balance -->
				<ion-card class="container header bg-blue">
					<ion-card-content>
						<ion-grid>
							<ion-row>
								<ion-col size="9">
									<p class="label">{{ $t('wallet.node-balance-label') }}</p>
									<p class="amount">1,432.45<span class="unit">DVPN</span></p>
								</ion-col>
								<ion-col size="3" class="ion-text-right">
									<ion-button fill="clear" size="large" class="refresh-button">
										<ion-icon :icon="refresh" size="large"
											aria-label="{{ $t('wallet.balance-refresh') }}" />
									</ion-button>
								</ion-col>
							</ion-row>
						</ion-grid>
					</ion-card-content>
				</ion-card>

				<!-- Public and Node Address -->
				<ion-card class="container addresses">
					<ion-card-content>
						<ion-button class="item" fill="clear"
							@click="copyToClipboard(t('wallet.clipboard-address'), address_public)">
							<div class=" content">
								<p class="label">
									{{ $t('wallet.public-address-label') }}<ion-icon :icon="copy" class="icon-right" />
								</p>
								<p class="value">{{ address_public }}</p>
							</div>
						</ion-button>
						<ion-button class="item" fill="clear"
							@click="copyToClipboard(t('wallet.clipboard-address'), address_node)">
							<div class="content">
								<p class="label">
									{{ $t('wallet.node-address-label') }}<ion-icon :icon="copy" class="icon-right" />
								</p>
								<p class="value">{{ address_node }}</p>
							</div>
						</ion-button>
					</ion-card-content>
				</ion-card>

				<!-- Latest Transactions -->
				<ion-card class="container list">
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
									<ion-icon :icon="link" size="large"></ion-icon>
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


.container
{
	&.header
	{
		&>ion-card-content>ion-grid>ion-row>ion-col
		{
			&>.label
			{
				font-size: 0.8rem;
				color: var(--ion-text-color);
			}

			&>.amount
			{
				font-size: 1.8rem;
				line-height: 1.8rem;
				color: var(--ion-text-color);

				&>.unit
				{
					display: block;
					font-size: 0.8rem;
				}
			}

			&>.refresh-button
			{
				--color: var(--ion-text-color);
			}
		}
	}

	&.addresses
	{

		.item
		{
			display: flex;
			justify-content: flex-start;
			align-items: flex-start;
			--padding: 0;

			&>.content
			{
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				width: 100%;
				gap: 0.5rem;

				&>.label
				{
					display: flex;
					margin: 0;
					align-items: flex-start;
					color: var(--ion-text-color);

					ion-icon
					{
						--color: var(--ion-text-color);
					}
				}

				&>.value
				{
					margin: 0;
					font-size: 0.7rem;
					color: var(--ion-text-color);
				}
			}
		}
	}
}

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
