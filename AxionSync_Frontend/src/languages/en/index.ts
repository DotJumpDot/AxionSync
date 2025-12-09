import common from "./common.json";
import home from "./home.json";
import memo from "./memo.json";
import mainmenu from "./mainmenu.json";

const messages = { common, home, memo, mainmenu };

export default messages;
export type Messages = typeof messages;
