// Holder class for utterances for builtin intents
// This could have been done as just a JSON file, but then requires build tool to include it in the lib dir
/*export class BuiltinUtterances {
    public static values(): {[id: string]: string[]} {
        return values;
    }
}

export const AudioPlayerIntents = [
    "AMAZON.PauseIntent",
    "AMAZON.ResumeIntent",
    "AMAZON.CancelIntent",
    "AMAZON.LoopOffIntent",
    "AMAZON.LoopOnIntent",
    "AMAZON.NextIntent",
    "AMAZON.PreviousIntent",
    "AMAZON.RepeatIntent",
    "AMAZON.ShuffleOffIntent",
    "AMAZON.ShuffleOnIntent",
    "AMAZON.StartOverIntent",
];*/

//const values = {
const BuiltinUtterances = {
    "AMAZON.CancelIntent": ["cancel", "never mind"],
    "AMAZON.HelpIntent": ["help", "help me"],
    "AMAZON.LoopOffIntent": ["loop off"],
    "AMAZON.LoopOnIntent": ["loop", "loop on", "keep repeating this song"],
    "AMAZON.MoreIntent": ["more"],
    "AMAZON.NavigateHomeIntent": ["home", "go home"],
    "AMAZON.NavigateSettingsIntent": ["settings"],
    "AMAZON.NextIntent": ["next", "skip", "skip forward"],
    "AMAZON.NoIntent": ["no", "no thanks"],
    "AMAZON.PageDownIntent": ["page down"],
    "AMAZON.PageUpIntent": ["page up"],
    "AMAZON.PauseIntent": ["pause", "pause that"],
    "AMAZON.PreviousIntent": ["go back", "previous", "skip back", "back up"],
    "AMAZON.RepeatIntent": ["repeat", "say that again", "repeat that"],
    "AMAZON.ResumeIntent": ["resume", "continue", "keep going"],
    "AMAZON.ScrollDownIntent": ["scroll down"],
    "AMAZON.ScrollLeftIntent": ["scroll left"],
    "AMAZON.ScrollRightIntent": ["scroll right"],
    "AMAZON.ScrollUpIntent": ["scroll up"],
    "AMAZON.ShuffleOffIntent": ["shuffle off", "stop shuffling", "turn off shuffle"],
    "AMAZON.ShuffleOnIntent": ["shuffle", "shuffle on", "shuffle the music", "shuffle mode"],
    "AMAZON.StartOverIntent": ["start over", "restart", "start again"],
    "AMAZON.StopIntent": ["stop", "off", "shut up"],
    "AMAZON.YesIntent": ["yes", "yes please", "sure"],
};

exports.BuiltinUtterances = BuiltinUtterances;
