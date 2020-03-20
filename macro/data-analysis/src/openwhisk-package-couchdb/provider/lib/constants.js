/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const TRIGGER_DB_SUFFIX = 'couchdbtrigger';
const DEFAULT_MAX_TRIGGERS = -1;
const RETRY_ATTEMPTS = 12;
const RETRY_DELAY = 1000; //in milliseconds
const REDIS_FIELD = 'active';
const FILTERS_DESIGN_DOC = 'triggerFilters';
const VIEWS_DESIGN_DOC = 'triggerViews';
const MONITOR_DESIGN_DOC = 'monitorFilters';
const TRIGGERS_BY_WORKER = 'triggers_by_worker';
const DOCS_FOR_MONITOR = 'canary_docs';
const MONITOR_INTERVAL = 5 * 1000 * 60; //in milliseconds


module.exports = {
    TRIGGER_DB_SUFFIX: TRIGGER_DB_SUFFIX,
    DEFAULT_MAX_TRIGGERS: DEFAULT_MAX_TRIGGERS,
    RETRY_ATTEMPTS: RETRY_ATTEMPTS,
    RETRY_DELAY: RETRY_DELAY,
    REDIS_FIELD: REDIS_FIELD,
    FILTERS_DESIGN_DOC: FILTERS_DESIGN_DOC,
    VIEWS_DESIGN_DOC: VIEWS_DESIGN_DOC,
    TRIGGERS_BY_WORKER: TRIGGERS_BY_WORKER,
    MONITOR_INTERVAL: MONITOR_INTERVAL,
    MONITOR_DESIGN_DOC: MONITOR_DESIGN_DOC,
    DOCS_FOR_MONITOR: DOCS_FOR_MONITOR
};
