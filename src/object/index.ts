//
//  index.ts
//
//  The MIT License
//  Copyright (c) 2021 - 2024 O2ter Limited. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//

import _ from 'lodash';
import { ISchema, TypeOfSchema, SchemaBuilder, InjectedValue, internalOf } from '../builder';
import { ValidateError } from '../error';

export const object = <S extends Record<string, ISchema<any, any>>>(shape: S) => SchemaBuilder<{ [K in keyof S]?: TypeOfSchema<S[K]>; }>({
  type: 'object',
  default: {},
  rules: [],
  cast: (v, typeCheck) => {
    if (!_.isPlainObject(v)) return undefined;
    const errors: ValidateError[] = [];
    const result: Record<string, any> = {};
    for (const [key, value] of _.entries(v)) {
      try {
        result[key] = _.isNil(shape[key]) ? value : internalOf(shape[key]).cast(value, typeCheck);
      } catch (e) {
        if (e instanceof ValidateError) {
          errors.push(new ValidateError({
            ...e.options,
            path: [key, ...e.path],
          }));
        } else {
          errors.push(..._.castArray(e) as ValidateError[]);
        }
      }
    }
    if (!_.isEmpty(errors)) throw errors;
    return result;
  },
  typeCheck: _.isPlainObject,
  validate: (value: any, root: any) => {

    if (_.isNil(value)) return [];

    const errors: ValidateError[] = [];

    for (const [key, type] of _.entries(shape)) {
      errors.push(...type.validate(new InjectedValue(value[key], root)).map(x => new ValidateError({
        ...x.options,
        path: [key, ...x.path],
      })));
    }

    return errors;
  },
}, {});
