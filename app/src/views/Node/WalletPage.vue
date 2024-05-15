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
	{ type: 'update-status', amount: '-0.009535 DVPN', hash: '3C83865A883865A883865A883865A83865A3865A9A6' },
	{ type: 'update-status', amount: '-0.01 DVPN', hash: '3C83883865A65A883865A883865A88386583865AA9A6' },
	{ type: 'update-status', amount: '-0.009645 DVPN', hash: '3C8386583A883865A883865A883865A883865865A83865AA9A6' },
	{ type: 'update-status', amount: '-0.01 DVPN', hash: '3C838658386A883865A883865A8838655AA9A6' },
	{ type: 'update-details', amount: '-0.009542 DVPN', hash: '3C83883865A83865A83A883865A883865865A65A9A6' },
	{ type: 'update-status', amount: '-0.009531 DVPN', hash: '3C8386583865A83A883865A883865A883865865A83865AA9A6' },
	{ type: 'update-status', amount: '-0.009742 DVPN', hash: '3C83865838683865A883865A883865A883865A83865A5AA9A6' },
	{ type: 'update-details', amount: '-0.009804 DVPN', hash: '3C83865A9A83A883865A883865A883865865A83865A83865A6' },
	{ type: 'receive', amount: '+50 DVPN', hash: '3C65A65A9838665A65A965A883865A883865A883865A65A95A9A6' }
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
						<ion-item v-for="(transaction, index) in transactions" :key="index" class="transaction">
							<ion-label>
								<div class="first-line">
									<p class="type">{{ $t(`wallet.${transaction.type}-label`) }}</p>
									<p class="amount">{{ transaction.amount }}</p>
								</div>
								<ion-button class="hash" fill="clear" expand="full">
									{{ transaction.hash }}
									<ion-icon :icon="link"></ion-icon>
								</ion-button>
							</ion-label>
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
					width: 100%;
					align-items: flex-start;
					font-size: 1.2rem;
					color: var(--container-label-color);

					&>ion-icon
					{
						margin-left: auto;
						--color: var(--ion-text-color);
					}
				}

				&>.value
				{
					margin: 0;
					width: 100%;
					font-size: 0.9rem;
					color: var(--ion-text-color);
					text-overflow: ellipsis;
					white-space: nowrap;
					overflow: hidden;
				}
			}
		}
	}
}

.transaction
{
	display: flex;
	align-items: center;
	--background: transparent;
	font-size: 1rem;

	&>ion-label
	{}

	&>span
	{}
}

.transaction
{
	display: flex;
	flex-direction: column;
	--padding-start: 0;
	--inner-padding-end: 0;

	ion-label
	{
		&>.first-line
		{
			display: flex;
			justify-content: space-between;
			width: 100%;

			&>.type
			{
				padding: 0.25rem 0.55rem;
				border-radius: 0.25rem;
				color: var(--ion-text-color);
				background: var(--app-background-color-secondary);
			}

			&>.amount
			{
				color: var(--ion-text-color);
				text-align: right;
			}
		}

		&>.hash
		{
			--padding-start: 0;
			--padding-end: 0;
			color: var(--container-label-color);
			align-self: flex-start;
			margin-top: 5px;
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
			width: 100%;

			&>ion-icon
			{
				margin-left: auto;
			}
		}
	}
}
</style>
