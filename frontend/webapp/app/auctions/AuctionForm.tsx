"use client";

import { Button } from "flowbite-react";
import React, { useEffect, useMemo } from "react";
import { Controller, FieldValues, useForm } from "react-hook-form";
import Input from "../components/Input";
import DateInput from "../components/DateInput";
import { createAuction, updateAuction } from "../actions/auctionActions";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Auction } from "@/types";
import { getMyProgress } from "../actions/gamificationActions";
import { useProfileStore } from "@/hooks/useProfileStore";

type Props = {
  auction?: Auction;
};

type FormValues = {
  title: string;
  brand: string;
  categorySelect: string;
  conditionSelect: string;
  customCategory: string;
  variant: string;
  colorway: string;
  releaseYear?: number;
  specs: string;
  imageUrl?: string;
  reservePrice?: number;
  auctionEnd?: Date;
};

export default function AuctionForm({ auction }: Props) {
  const categories = useMemo(
    () => [
      "Keyboard",
      "Mouse",
      "Monitor",
      "GPU",
      "PC",
      "Headset",
      "Chair",
      "Accessories",
      "Streaming",
      "Console",
      "Laptop",
      "Audio",
      "Other",
    ],
    []
  );
  const conditions = useMemo(() => ["New", "Open-Box", "Used", "Other"], []);
  const currentYear = new Date().getFullYear() + 1;

  const router = useRouter();
  const pathname = usePathname();
  const setProfile = useProfileStore((state) => state.setProfile);
  const {
    control,
    handleSubmit,
    setFocus,
    reset,
    watch,
    formState: { isSubmitting, isValid },
  } = useForm<FormValues>({
    mode: "onTouched",
    defaultValues: {
      categorySelect: categories[0],
      conditionSelect: conditions[0],
      customCategory: "",
    },
  });

  const categorySelect = watch("categorySelect");
  const conditionSelect = watch("conditionSelect");

  useEffect(() => {
    if (auction) {
      const {
        title,
        brand,
        category,
        variant,
        condition,
        colorway,
        releaseYear,
        specs,
      } = auction;

      const isCustomCategory = category && !categories.includes(category);
      reset({
        title,
        brand,
        categorySelect: isCustomCategory ? "Other" : category,
        customCategory: isCustomCategory ? category : "",
        conditionSelect: conditions.includes(condition) ? condition : "Other",
        variant,
        colorway,
        releaseYear,
        specs,
      });
    }
    setFocus("title");
  }, [setFocus, reset, auction, categories, conditions]);

  async function onSubmit(data: FieldValues) {
    try {
      let id = "";
      let res;
      const finalCategory =
        data.categorySelect === "Other"
          ? data.customCategory || "Other"
          : data.categorySelect;
      const payload: FieldValues = {
        title: data.title,
        brand: data.brand,
        category: finalCategory,
        variant: data.variant,
        condition: data.conditionSelect === "Other" ? "Other" : data.conditionSelect,
        colorway: data.colorway,
        releaseYear: data.releaseYear ? Number(data.releaseYear) : undefined,
        specs: data.specs,
      };

      if (pathname === "/auctions/create") {
        res = await createAuction({
          ...payload,
          imageUrl: data.imageUrl,
          reservePrice: data.reservePrice ? Number(data.reservePrice) : 0,
          auctionEnd: data.auctionEnd,
        });
        id = res.id;
        try {
          const profile = await getMyProgress();
          setProfile(profile ?? undefined);
        } catch (_) {}
      } else {
        if (auction) {
          res = await updateAuction(payload, auction.id);
          id = auction.id;
        }
      }

      if (res.error) {
        throw res.error;
      }
      router.push(`/auctions/details/${id}`);
    } catch (error: any) {
      toast.error(error.status + " " + error.message);
      console.log(error);
    }
  }

  return (
    <form
      className="flex flex-col mt-3 glass-panel rounded-3xl p-6 gap-2 ios-shadow border border-white/70"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Input
        label="Title"
        name="title"
        control={control}
        rules={{ required: "Title is required" }}
      />
      <Input
        label="Brand"
        name="brand"
        control={control}
        rules={{ required: "Brand is required" }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Controller
          name="categorySelect"
          control={control}
          rules={{ required: "Category is required" }}
          render={({ field, fieldState }) => (
            <div className="mb-3">
              <div className="mb-2 block">
                <label className="text-slate-700 text-sm font-medium">
                  Category
                </label>
              </div>
              <select
                {...field}
                className={`w-full rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-[#5b7bff]/30 focus:border-[#5b7bff]/60 ${fieldState.error ? "border-rose-400" : ""}`}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {fieldState.error && (
                <p className="text-xs text-rose-500 mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="conditionSelect"
          control={control}
          rules={{ required: "Condition is required" }}
          render={({ field, fieldState }) => (
            <div className="mb-3">
              <div className="mb-2 block">
                <label className="text-slate-700 text-sm font-medium">
                  Condition
                </label>
              </div>
              <select
                {...field}
                className={`w-full rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-[#5b7bff]/30 focus:border-[#5b7bff]/60 ${fieldState.error ? "border-rose-400" : ""}`}
              >
                {conditions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {fieldState.error && (
                <p className="text-xs text-rose-500 mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      {categorySelect === "Other" && (
        <Input
          label="Custom category"
          name="customCategory"
          control={control}
          rules={{ required: "Please enter a category name" }}
        />
      )}

      <Input
        label="Variant or key specs (e.g. 75% RGB, 170Hz, 16GB)"
        name="variant"
        control={control}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label="Colorway" name="colorway" control={control} />
        <Input
          label="Release Year"
          name="releaseYear"
          control={control}
          type="number"
          rules={{
            validate: (value: any) => {
              if (!value) return true;
              const year = Number(value);
              return year >= 1980 && year <= currentYear
                ? true
                : `Enter a valid year between 1980 and ${currentYear}`;
            },
          }}
        />
      </div>

      <Input label="Specs (short blurb)" name="specs" control={control} />

      {pathname === "/auctions/create" && (
        <>
          <Input
            label="Image URL (accepted domains : cdn.pixabay.com, people.com, res.cloudinary.com)"
            name="imageUrl"
            control={control}
            rules={{ required: "Image URL is required" }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Reserve Price in FLOG (enter 0 if no reserve)"
              name="reservePrice"
              control={control}
              type="number"
              rules={{ required: "Reserve price is required" }}
            />
            <DateInput
              label="Auction end date/time"
              name="auctionEnd"
              control={control}
              dateFormat="dd MMMM yyyy h:mm a"
              showTimeSelect
              rules={{ required: "Auction end date is required" }}
            />
          </div>
        </>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button outline color="light" className="soft-button-ghost">
          Cancel
        </Button>
        <Button
          isProcessing={isSubmitting}
          disabled={!isValid}
          type="Submit"
          color="blue"
          className="soft-button px-6 py-2"
        >
          Submit
        </Button>
      </div>
    </form>
  );
}
