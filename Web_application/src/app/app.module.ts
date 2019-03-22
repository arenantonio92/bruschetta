import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes} from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { RestService} from '../services/rest.service';
import { PersonalAreaComponent } from './personal-area/personal-area.component';
import { BatchComponent } from './batch/batch.component';
import { ProductComponent } from './product/product.component';
import { HomepageComponent } from './homepage/homepage.component';
import { BasementComponent } from './basement/basement.component';
import { ProductionProcessComponent } from './production-process/production-process.component';
import { MyBatchComponent } from './my-batch/my-batch.component';
import { MyProductComponent } from './my-product/my-product.component';
import { PlantationComponent } from './plantation/plantation.component';
import { FarmingComponent } from './farming/farming.component';
import { BatchShipmentComponent } from './batch-shipment/batch-shipment.component';
import { ProductShipmentComponent } from './product-shipment/product-shipment.component';
import { ShopComponent } from './shop/shop.component';
import { OrderComponent } from './order/order.component';

const appRoutes: Routes = [
  { path: '**', component: AppComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    PersonalAreaComponent,
    BatchComponent,
    ProductComponent,
    HomepageComponent,
    BasementComponent,
    ProductionProcessComponent,
    MyBatchComponent,
    MyProductComponent,
    PlantationComponent,
    FarmingComponent,
    BatchShipmentComponent,
    ProductShipmentComponent,
    ShopComponent,
    OrderComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      {
        path: 'product',
        component: ProductComponent
      },
      {
        path: 'batch',
        component: BatchComponent
      },
      {
        path: 'personalArea',
        component: PersonalAreaComponent
      },
      {
        path: "home",
        component: HomepageComponent
      },
      {
        path: "basement",
        component: BasementComponent
      },
      {
        path: "myBatch",
        component: MyBatchComponent
      },
      {
        path: "myProduct",
        component: MyProductComponent
      },
      {
        path: "productionProcess",
        component: ProductionProcessComponent
      },
      {
        path: "plantation",
        component: PlantationComponent
      },
      {
        path: "farming",
        component: FarmingComponent
      },
      {
        path: "batchShipment",
        component: BatchShipmentComponent
      },
      {
        path: "productShipment",
        component: ProductShipmentComponent
      },
      {
        path: "shop",
        component: ShopComponent
      },
      {
        path: "order",
        component: OrderComponent
      }
    ]),
  ],
  providers: [RestService],
  bootstrap: [AppComponent]
})
export class AppModule { }
