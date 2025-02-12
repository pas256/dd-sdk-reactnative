/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

import type Timer from "../../Timer";


export interface DdRumXhr extends XMLHttpRequest {

  _datadog_xhr: DdRumXhrContext

}

export interface DdRumXhrContext {
  method: string,
  url: string,
  reported: boolean,
  timer: Timer,
  spanId: string,
  traceId: string
}
