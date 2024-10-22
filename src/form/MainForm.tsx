/**
 * Zde vytvořte formulář pomocí knihovny react-hook-form.
 * Formulář by měl splňovat:
 * 1) být validován yup schématem
 * 2) formulář obsahovat pole "NestedFields" z jiného souboru
 * 3) být plně TS typovaný
 * 4) nevalidní vstupy červeně označit (background/outline/border) a zobrazit u nich chybové hlášky
 * 5) nastavte výchozí hodnoty objektem initalValues
 * 6) mít "Submit" tlačítko, po jeho stisku se vylogují data z formuláře:  "console.log(formData)"
 *
 * V tomto souboru budou definovány pole:
 * amount - number; Validace min=0, max=300
 * damagedParts - string[] formou multi-checkboxu s volbami "roof", "front", "side", "rear"
 * vykresleny pole z form/NestedFields
 */

import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import NestedFields from "./NestedFields";

// příklad očekávaného výstupního JSON, předvyplňte tímto objektem formulář

type DamagedParts = "roof" | "front" | "side" | "rear";

const damagedPartsOptions: DamagedParts[] = ["roof", "front", "side", "rear"];

export type FormValues = {
  amount: number;
  allocation: number;
  category: string;
  damagedParts: DamagedParts[];
  witnesses: SingleWitness[];
};

type SingleWitness = {
  name: string;
  email?: string;
};

const initialValues: FormValues = {
  amount: 250,
  allocation: 140,
  damagedParts: ["side", "rear"],
  category: "kitchen-accessories",
  witnesses: [
    {
      name: "Marek",
      email: "marek@email.cz",
    },
    {
      name: "Emily",
      email: "emily.johnson@x.dummyjson.com",
    },
  ],
};

const formSchema = yup
  .object()
  .shape({
    amount: yup.number().required().min(0).max(300),
    allocation: yup
      .number()
      .min(0)
      .max(yup.ref("amount"))
      .required("Allocation is required field!"),
    damagedParts: yup
      .array()
      .of(
        yup
          .mixed<DamagedParts>()
          .oneOf(Object.values(damagedPartsOptions))
          .required()
      )
      .min(1)
      .max(5)
      .required(),
    category: yup.string().required(),
    witnesses: yup
      .array()
      .of(
        yup.object().shape({
          name: yup.string().required("Name is required field!"),
          email: yup
            .string()
            .email("Must be a valid email!")
            .test("unique-email", "Email already exists!", async (value) => {
              const response = await fetch(
                `https://dummyjson.com/users/search?q=${value}`
              );
              const data = await response.json();
              return data.users.length === 0;
            }),
        })
      )
      .min(1)
      .max(5)
      .required(),
  })
  .required();

const MainForm = () => {
  const methods = useForm<FormValues>({
    resolver: yupResolver(formSchema),
    defaultValues: initialValues,
  });
  const handleOnSubmit = (formData: FormValues) => {
    console.log("🚀 ~ handleOnSubmit ~ data:", formData);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleOnSubmit)}>
        <div>
          <label>Amount</label>
          <Controller
            name="amount"
            control={methods.control}
            render={({ field }) => (
              <input
                type="number"
                {...field}
                style={{
                  borderColor: methods.formState.errors.amount ? "red" : "",
                }}
              />
            )}
          />
          {methods.formState.errors.amount && (
            <p style={{ color: "red" }}>
              {methods.formState.errors.amount.message}
            </p>
          )}
        </div>

        <div>
          <label>Damaged Parts</label>
          {Object.values(damagedPartsOptions).map((part) => (
            <div key={part}>
              <Controller
                name="damagedParts"
                control={methods.control}
                render={({ field }) => (
                  <label>
                    <input
                      {...field}
                      type="checkbox"
                      value={part}
                      checked={field.value.includes(part)}
                      onChange={() => {
                        const newValue = field.value.includes(part)
                          ? field.value.filter((v) => v !== part)
                          : [...field.value, part];
                        field.onChange(newValue);
                      }}
                      style={{
                        outline: methods.formState.errors.damagedParts
                          ? "3px solid red"
                          : undefined,
                      }}
                    />
                    {part}
                  </label>
                )}
              />
            </div>
          ))}
          {methods.formState.errors.damagedParts && (
            <p style={{ color: "red" }}>
              {methods.formState.errors.damagedParts.message}
            </p>
          )}
        </div>

        <NestedFields />
        <br />
        <br />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

export default MainForm;
