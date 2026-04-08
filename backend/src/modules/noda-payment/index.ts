import { ModuleProvider } from "@medusajs/framework/utils";
import { NodaPaymentProviderService } from "./services/noda-payment";

export default ModuleProvider("noda-payment", {
  services: [NodaPaymentProviderService],
});
