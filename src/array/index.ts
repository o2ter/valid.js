//
//  index.ts
//
//  The MIT License
//  Copyright (c) 2021 - 2025 O2ter Limited. All rights reserved.
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
import * as _rules from './rules';

export const array = <T extends ISchema<any, any>>(type?: T) => SchemaBuilder<TypeOfSchema<T>[], typeof _rules>({
  type: 'array',
  default: [],
  rules: [],
  cast: (v, typeCheck) => {
    if (!_.isArray(v)) return undefined;
    if (_.isNil(type)) return v;
    const errors: ValidateError[] = [];
    const result: any[] = [];
    const _type = internalOf(type);
    for (const [i, value] of v.entries()) {
      try {
        result[i] = _type.cast(value, typeCheck);
      } catch (e) {
        if (e instanceof ValidateError) {
          errors.push(new ValidateError({
            ...e.options,
            path: [`${i}`, ...e.path],
          }));
        } else {
          errors.push(..._.castArray(e) as ValidateError[]);
        }
      }
    }
    if (!_.isEmpty(errors)) throw errors;
    return result;
  },
  typeCheck: _.isArray,
  validate: (value: any, root: any) => {

    if (_.isNil(value) || _.isNil(type)) return [];

    const errors: ValidateError[] = [];

    for (const [i, item] of value.entries()) {
      errors.push(...type.validate(new InjectedValue(item, root)).map(x => new ValidateError({
        ...x.options,
        path: [`${i}`, ...x.path],
      })));
    }

    return errors;
  },
}, _rules);
