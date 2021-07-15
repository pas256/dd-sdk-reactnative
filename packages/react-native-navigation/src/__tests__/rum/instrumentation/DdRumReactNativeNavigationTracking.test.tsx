/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

import React from 'react';
import { View, Text, Button, AppState } from 'react-native';
import { DdRum } from '@datadog/reactnative-sdk';
import DdRumReactNativeNavigationTracking from '../../../rum/instrumentation/DdRumReactNativeNavigationTracking';
import { Navigation } from 'react-native-navigation';

jest.mock('@datadog/reactnative-sdk', () => {
    return {
        DdRum: {
            startView: jest.fn().mockImplementation(() => { }),
            stopView: jest.fn().mockImplementation(() => { })
        },
    };
});
jest.useFakeTimers();

let mockRegisterComponentListener = jest.fn().mockImplementation(() => { })
jest.mock('react-native-navigation', () => {
    return {
        Navigation: {
            events: jest.fn().mockImplementation(() => { 
                return {
                    registerComponentListener: mockRegisterComponentListener
                }
            })
        }
    }
});


let originalCreateMethod: Function

beforeEach(() => {
    
    jest.setTimeout(20000);
    DdRum.startView.mockClear();
    DdRum.stopView.mockClear();
    mockRegisterComponentListener.mockClear();
    
    DdRumReactNativeNavigationTracking['trackedComponentIds'] = [];
    DdRumReactNativeNavigationTracking['isTracking'] = false;
    originalCreateMethod = React.createElement
})

afterEach(() => {
    React.createElement = originalCreateMethod
})

// Unit tests

it('M register only once W startTracking()', async () => {
    // GIVEN
    let componentId = "component42"
    DdRumReactNativeNavigationTracking.startTracking();

    // WHEN
    const testInstance = React.createElement('View', { 'componentId': componentId});
    const otherTestInstance = React.createElement('View', { 'componentId': componentId, 'something': 'else'});

    // THEN
    expect(mockRegisterComponentListener.mock.calls.length).toBe(1);
})

it('M restore original createElement method W stopTracking()', async () => {
    // GIVEN
    let componentId = "component42"
    DdRumReactNativeNavigationTracking.startTracking();

    // WHEN
    DdRumReactNativeNavigationTracking.stopTracking();
    const testInstance = React.createElement('View', { 'componentId': componentId});

    // THEN
    expect(mockRegisterComponentListener.mock.calls.length).toBe(0);
})

it('M send a RUM ViewEvent W startTracking() componentDidAppear', async () => {
    // GIVEN
    let componentId = "component42"
    DdRumReactNativeNavigationTracking.startTracking();

    // WHEN
    const testInstance = React.createElement('View', { 'componentId': componentId});
    const listener = mockRegisterComponentListener.mock.calls[0][0];
    const componentName = "some-name";
    listener.componentDidAppear({componentName: componentName});

    // THEN
    expect(DdRum.startView.mock.calls.length).toBe(1);
    expect(DdRum.startView.mock.calls[0][0]).toBe(componentId);
    expect(DdRum.startView.mock.calls[0][1]).toBe(componentName);
    expect(DdRum.startView.mock.calls[0][3]).toStrictEqual({});
})



it('M send a RUM ViewEvent W startTracking() componentDidDisappear', async () => {

    // GIVEN
    let componentId = "component42"
    DdRumReactNativeNavigationTracking.startTracking();

    // WHEN
    const testInstance = React.createElement('View', { 'componentId': componentId});
    const listener = mockRegisterComponentListener.mock.calls[0][0];
    listener.componentDidDisappear();

    // THEN
    expect(DdRum.stopView.mock.calls.length).toBe(1);
    expect(DdRum.stopView.mock.calls[0][0]).toBe(componentId);
    expect(DdRum.stopView.mock.calls[0][2]).toStrictEqual({});
})