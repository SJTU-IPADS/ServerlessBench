/*
 * Copyright (c) 2020 Institution of Parallel and Distributed System, Shanghai Jiao Tong University
 * ServerlessBench is licensed under the Mulan PSL v1.
 * You can use this software according to the terms and conditions of the Mulan PSL v1.
 * You may obtain a copy of Mulan PSL v1 at:
 *     http://license.coscl.org.cn/MulanPSL
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
 * PURPOSE.
 * See the Mulan PSL v1 for more details.
 */

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
