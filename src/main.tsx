import App from "./App.tsx";
import registerCard from "./utilities/registerCard.ts";

registerCard("solstice-visualizer-card", App);
registerCard("solstice-visualizer-card-editor", () => <div>Editor</div>);
