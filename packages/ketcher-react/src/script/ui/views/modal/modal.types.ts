/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

interface BaseProps {
  className: string;
  formState: {
    errors: Record<string, string>;
    result: Record<string, any>;
    valid: boolean;
  };
}

interface BaseCallProps {
  onCancel: () => void;
  onOk: (result: any) => void;
}

interface ModalContainerProps {
  ketcherId: string;
}

export type { BaseProps, BaseCallProps, ModalContainerProps };
