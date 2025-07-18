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

export enum ChemicalMimeType {
  Mol = 'chemical/x-mdl-molfile',
  Rxn = 'chemical/x-mdl-rxnfile',
  DaylightSmiles = 'chemical/x-daylight-smiles',
  ExtendedSmiles = 'chemical/x-chemaxon-cxsmiles',
  DaylightSmarts = 'chemical/x-daylight-smarts',
  InChI = 'chemical/x-inchi',
  InChIAuxInfo = 'chemical/x-inchi-aux',
  InChIKey = 'chemical/x-inchi-key',
  CDX = 'chemical/x-cdx',
  CDXML = 'chemical/x-cdxml',
  CML = 'chemical/x-cml',
  KET = 'chemical/x-indigo-ket',
  UNKNOWN = 'chemical/x-unknown',
  SDF = 'chemical/x-sdf',
  FASTA = 'chemical/x-fasta',
  SEQUENCE = 'chemical/x-sequence',
  PeptideSequenceThreeLetter = 'chemical/x-peptide-sequence-3-letter',
  RNA = 'chemical/x-rna-sequence',
  DNA = 'chemical/x-dna-sequence',
  PEPTIDE = 'chemical/x-peptide-sequence',
  IDT = 'chemical/x-idt',
  HELM = 'chemical/x-helm',
  RDF = 'chemical/x-rdf',
}

export interface WithStruct {
  struct: string;
}

export interface WithFormat {
  format: ChemicalMimeType;
}

export interface WithOutputFormat {
  output_format: ChemicalMimeType;
}
export interface WithInputFormat {
  input_format?: ChemicalMimeType;
}

export interface WithSelection {
  selected?: Array<number>;
}

export type CheckTypes =
  | 'radicals'
  | 'pseudoatoms'
  | 'stereo'
  | 'query'
  | 'overlapping_atoms'
  | 'overlapping_bonds'
  | 'rgroups'
  | 'chiral'
  | '3d'
  | 'chiral_flag'
  | 'valence';

export interface CheckData extends WithStruct {
  types: Array<CheckTypes>;
}

export interface CheckResult {
  [key: string]: string;
}

export interface ConvertData
  extends WithStruct,
    WithOutputFormat,
    WithInputFormat {}

export interface ConvertResult extends WithStruct, WithFormat {}

export interface LayoutData extends WithStruct, WithOutputFormat {}

export interface LayoutResult extends WithStruct, WithFormat {}

export interface CleanData
  extends WithStruct,
    WithSelection,
    WithOutputFormat {}

export interface CleanResult extends WithStruct, WithFormat {}

export interface AromatizeData extends WithStruct, WithOutputFormat {}

export interface AromatizeResult extends WithStruct, WithFormat {}

export interface DearomatizeData extends WithStruct, WithOutputFormat {}

export interface DearomatizeResult extends WithStruct, WithFormat {}

export interface CalculateCipData extends WithStruct, WithOutputFormat {}

export interface CalculateCipResult extends WithStruct, WithFormat {}

export interface ExplicitHydrogensData extends WithStruct, WithOutputFormat {
  mode?: 'auto' | 'fold' | 'unfold';
}

export type CalculateMacromoleculePropertiesData = WithStruct;

export interface SingleChainMacromoleculeProperties {
  grossFormula?: string;
  mass?: number;
  monomerCount: {
    nucleotides?: Record<string, number>;
    peptides?: Record<string, number>;
  };
  pKa?: number;
  extinctionCoefficient?: number;
  hydrophobicity?: number[];
  Tm?: number;
}

export interface CalculateMacromoleculePropertiesResult {
  properties: string;
}

export interface ExplicitHydrogensResult extends WithStruct, WithFormat {}

export type CalculateProps =
  | 'molecular-weight'
  | 'most-abundant-mass'
  | 'monoisotopic-mass'
  | 'gross'
  | 'mass-composition';

export interface CalculateData extends WithStruct, WithSelection {
  properties: Array<CalculateProps>;
}

export type CalculateResult = Record<CalculateProps, string | number | boolean>;

export type AutomapMode = 'discard' | 'keep' | 'alter' | 'clear';

export type AutoMapOptions = 'Discard' | 'Keep' | 'Alter' | 'Clear';

export interface AutomapData extends WithStruct, WithOutputFormat {
  mode: AutomapMode;
}

export interface AutomapResult extends WithStruct, WithFormat {}

export interface InfoResult {
  indigoVersion: string;
  imagoVersions: Array<string>;
  isAvailable: boolean;
}

export interface RecognizeResult extends WithStruct, WithOutputFormat {}

export interface StructServiceOptions {
  [key: string]: string | number | boolean | undefined;
}

export type OutputFormatType = 'png' | 'svg';
export interface GenerateImageOptions extends StructServiceOptions {
  outputFormat: OutputFormatType;
  backgroundColor?: string;
}

export interface StructService {
  addKetcherId: (id: string) => void;
  info: () => Promise<InfoResult>;
  convert: (
    data: ConvertData,
    options?: StructServiceOptions,
  ) => Promise<ConvertResult>;
  layout: (
    data: LayoutData,
    options?: StructServiceOptions,
  ) => Promise<LayoutResult>;
  clean: (
    data: CleanData,
    options?: StructServiceOptions,
  ) => Promise<CleanResult>;
  aromatize: (
    data: AromatizeData,
    options?: StructServiceOptions,
  ) => Promise<AromatizeResult>;
  dearomatize: (
    data: DearomatizeData,
    options?: StructServiceOptions,
  ) => Promise<DearomatizeResult>;
  calculateCip: (
    data: CalculateCipData,
    options?: StructServiceOptions,
  ) => Promise<CalculateCipResult>;
  automap: (
    data: AutomapData,
    options?: StructServiceOptions,
  ) => Promise<AutomapResult>;
  check: (
    data: CheckData,
    options?: StructServiceOptions,
  ) => Promise<CheckResult>;
  calculate: (
    data: CalculateData,
    options?: StructServiceOptions,
  ) => Promise<CalculateResult>;
  recognize: (blob: Blob, version: string) => Promise<RecognizeResult>;
  getInChIKey: (struct: string) => Promise<string>;
  generateImageAsBase64: (
    data: string,
    options?: GenerateImageOptions,
  ) => Promise<string>;
  toggleExplicitHydrogens: (
    data: ExplicitHydrogensData,
    options?: StructServiceOptions,
  ) => Promise<ExplicitHydrogensResult>;
  calculateMacromoleculeProperties: (
    data: CalculateMacromoleculePropertiesData,
    options?: StructServiceOptions,
  ) => Promise<CalculateMacromoleculePropertiesResult>;
  destroy?: () => void;
}
