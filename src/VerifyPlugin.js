import { FlexPlugin } from "@twilio/flex-plugin";
import VerifyTab from "./components/VerifyTab";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import { CustomizationProvider } from "@twilio-paste/core/customization";
import { Tab } from "@twilio/flex-ui";

const PLUGIN_NAME = "VerifyPlugin";

export default class VerifyPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    // Add Paste
    flex.setProviders({
      PasteThemeProvider: CustomizationProvider,
    });

    flex.TaskCanvasTabs.Content.add(
      <Tab
        icon="<VerifiedUserIcon />"
        iconActive={<VerifiedUserIcon />}
        uniqueName="verify-customer"
        key="verify-customer"
        label="Verify"
      >
        <VerifyTab />
      </Tab>
    );
  }
}
