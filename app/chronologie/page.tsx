"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import Chronologie from "@/components/Chronologie";
import {
  fusionnerChronologie,
  type EntreeChronologie,
  type FaitSource,
  type FraisSource,
  type PensionSource,
  type PreuveSource,
  type TypeEntree,
} from "@/lib/chronologie";
import {
  getProcedureActiveId,
  getEnfantsDeProcedureActive,
  type EnfantProcedure,
} from "@/lib/procedureActive";
import { filtrerEtFormaterPourPdf } from
