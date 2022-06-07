// ported from https://github.com/vuejs/vue-next/blob/master/packages/runtime-core/src/apiWatch.ts by Evan You

import {
  ComputedRef,
  EffectScheduler,
  isReactive,
  isRef,
  ReactiveEffect,
  ReactiveEffectOptions,
  Ref,
} from '@vue/reactivity';
import {
  hasChanged,
  isArray,
  isFunction,
  isMap,
  isObject,
  isPlainObject,
  isSet,
  NOOP,
} from '@vue/shared';
import { callWithAsyncErrorHandling, callWithErrorHandling, warn } from './errorHandling';

export type WatchEffect = (onInvalidate: InvalidateCbRegistrator) => void;

export type WatchSource<T = any> = Ref<T> | ComputedRef<T> | (() => T);

export type WatchCallback<V = any, OV = any> = (
  value: V,
  oldValue: OV,
  onInvalidate: InvalidateCbRegistrator,
) => any;

export type WatchStopHandle = () => void;

type MapSources<T> = {
  [K in keyof T]: T[K] extends WatchSource<infer V> ? V : T[K] extends object ? T[K] : never;
};

type MapOldSources<T, Immediate> = {
  [K in keyof T]: T[K] extends WatchSource<infer V>
    ? Immediate extends true
      ? V | undefined
      : V
    : T[K] extends object
    ? Immediate extends true
      ? T[K] | undefined
      : T[K]
    : never;
};

type InvalidateCbRegistrator = (cb: () => void) => void;
const invoke = (fn: Function) => fn();
const INITIAL_WATCHER_VALUE = {};

export interface WatchOptionsBase {
  /**
   * @depreacted ignored in `@vue-reactivity/watch` and will always be `sync`
   */
  flush?: 'sync' | 'pre' | 'post';
  onTrack?: ReactiveEffectOptions['onTrack'];
  onTrigger?: ReactiveEffectOptions['onTrigger'];
}

export interface WatchOptions<Immediate = boolean> extends WatchOptionsBase {
  immediate?: Immediate;
  deep?: boolean;
}

// Simple effect.
export function watchEffect(effect: WatchEffect, options?: WatchOptionsBase): WatchStopHandle {
  return doWatch(effect, null, options);
}

// overload #1: array of multiple sources + cb
// Readonly constraint helps the callback to correctly infer value types based
// on position in the source array. Otherwise the values will get a union type
// of all possible value types.
export function watch<
  T extends Readonly<Array<WatchSource<unknown> | object>>,
  Immediate extends Readonly<boolean> = false,
>(
  sources: T,
  cb: WatchCallback<MapSources<T>, MapOldSources<T, Immediate>>,
  options?: WatchOptions<Immediate>,
): WatchStopHandle;

// overload #2: single source + cb
export function watch<T, Immediate extends Readonly<boolean> = false>(
  source: WatchSource<T>,
  cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
  options?: WatchOptions<Immediate>,
): WatchStopHandle;

// overload #3: watching reactive object w/ cb
export function watch<T extends object, Immediate extends Readonly<boolean> = false>(
  source: T,
  cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
  options?: WatchOptions<Immediate>,
): WatchStopHandle;

// implementation
export function watch<T = any>(
  source: WatchSource<T> | WatchSource<T>[],
  cb: WatchCallback<T>,
  options?: WatchOptions,
): WatchStopHandle {
  return doWatch(source, cb, options);
}

function doWatch(
  source: WatchSource | WatchSource[] | WatchEffect,
  cb: WatchCallback | null,
  { immediate, deep }: WatchOptions = {},
): WatchStopHandle {
  let getter: () => any;
  if (isArray(source) && !isReactive(source)) {
    getter = () =>
      // eslint-disable-next-line array-callback-return
      source.map((s) => {
        if (isRef(s)) return s.value;
        else if (isReactive(s)) return traverse(s);
        else if (isFunction(s)) return callWithErrorHandling(s, 'watch getter');
        else warn('invalid source');
      });
  } else if (isRef(source)) {
    getter = () => source.value;
  } else if (isReactive(source)) {
    getter = () => source;
    deep = true;
  } else if (isFunction(source)) {
    if (cb) {
      // getter with cb
      getter = () => callWithErrorHandling(source, 'watch getter');
    } else {
      // no cb -> simple effect
      getter = () => {
        if (cleanup) cleanup();

        return callWithErrorHandling(source, 'watch callback', [onInvalidate]);
      };
    }
  } else {
    getter = NOOP;
  }

  if (cb && deep) {
    const baseGetter = getter;
    getter = () => traverse(baseGetter());
  }

  let cleanup: () => void;
  const onInvalidate: InvalidateCbRegistrator = (fn: () => void) => {
    cleanup = effect.onStop = () => {
      callWithErrorHandling(fn, 'watch cleanup');
    };
  };

  let oldValue = isArray(source) ? [] : INITIAL_WATCHER_VALUE;
  const job = () => {
    if (cb) {
      const newValue = effect.run();
      if (deep || hasChanged(newValue, oldValue)) {
        // cleanup before running cb again
        if (cleanup) cleanup();

        callWithAsyncErrorHandling(cb, 'watch callback', [
          newValue,
          // pass undefined as the old value when it's changed for the first time
          oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue,
          onInvalidate,
        ]);
        oldValue = newValue;
      }
    } else {
      // watchEffect
      effect.run();
    }
    // cb ? () => {
    //     }
    //   }
    //   :
    // undefined
  };

  let scheduler: EffectScheduler = job;

  // if (flush === 'sync') {
  //   scheduler = job as any; // the scheduler function gets called directly
  // }
  // // else if (flush === 'post') {
  // //   scheduler = () => queuePostRenderEffect(job, instance && instance.suspense)
  // // }
  // else {
  //   // default: 'pre'
  //   // 调度器实现
  //   const queue: Function[] = [];
  //   let isFlushing = false;
  //   scheduler = () => {
  //     if (!queue.includes(job)) queue.push(job);
  //     if (!isFlushing) {
  //       isFlushing = true;
  //       Promise.resolve().then(() => {
  //         let fn;
  //         try {
  //           while ((fn = queue.shift())) {
  //             fn();
  //           }
  //         } finally {
  //           isFlushing = false;
  //         }
  //       });
  //     }
  //   };
  // }

  // const runner = effect(getter, {
  //   lazy: true,
  //   onTrack,
  //   onTrigger,
  //   // scheduler: applyCb ? () => scheduler(applyCb) : scheduler,
  // });

  const effect = new ReactiveEffect(getter, scheduler);

  // initial run
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect.run();
    }
  } else {
    effect.run();
  }

  return () => {
    effect.stop();
  };
}

const enum ReactiveFlags {
  SKIP = '__v_skip',
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  RAW = '__v_raw',
}

function traverse(value: unknown, seen: Set<unknown> = new Set()) {
  if (!isObject(value) || (value as any)[ReactiveFlags.SKIP]) {
    return value;
  }
  seen = seen || new Set();
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  if (isRef(value)) {
    traverse(value.value, seen);
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v: any) => {
      traverse(v, seen);
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse((value as any)[key], seen);
    }
  }
  return value;
}
