"use client";

import React from "react";
import { Mail, Phone, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerContact } from "@/lib/types/JobDataEnhanced";

interface CustomerInfoProps {
  customer: CustomerContact;
  loading?: boolean;
  className?: string;
}

// Contact method icons and colors
const CONTACT_METHOD_CONFIG = {
  email: {
    icon: Mail,
    color: "text-blue-600 dark:text-blue-400",
    label: "Email preferred",
  },
  phone: {
    icon: Phone,
    color: "text-green-600 dark:text-green-400",
    label: "Phone preferred",
  },
  text: {
    icon: Phone,
    color: "text-purple-600 dark:text-purple-400",
    label: "Text preferred",
  },
} as const;

export function CustomerInfo({
  customer,
  loading = false,
  className,
}: CustomerInfoProps) {
  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader className="pb-3">
          <div className="animate-pulse">
            <div className="h-5 bg-muted rounded w-32 mb-2"></div>
            <div className="h-3 bg-muted rounded w-20"></div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-muted rounded w-16 mb-1"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const primaryEmail = customer.emails?.[0];
  const primaryPhone = customer.phones?.[0];
  const location = customer.address
    ? `${customer.address.city}, ${customer.address.state}`
    : "Location not provided";

  const contactMethod =
    customer.contact_preferences?.preferred_method || "email";
  const ContactIcon = CONTACT_METHOD_CONFIG[contactMethod]?.icon || User;
  const contactColor =
    CONTACT_METHOD_CONFIG[contactMethod]?.color || "text-muted-foreground";

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ContactIcon className={`w-4 h-4 ${contactColor}`} />
            <span className="font-semibold truncate">{customer.name}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Customer
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {/* Primary Email */}
          <div>
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Primary Email
            </div>
            {primaryEmail ? (
              <a
                href={`mailto:${primaryEmail}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer text-xs transition-colors"
                title={`Send email to ${primaryEmail}`}
              >
                {primaryEmail.length > 20
                  ? `${primaryEmail.substring(0, 17)}...`
                  : primaryEmail}
              </a>
            ) : (
              <span className="text-xs text-muted-foreground">
                Not provided
              </span>
            )}
          </div>

          {/* Primary Phone */}
          <div>
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              Phone
            </div>
            {primaryPhone ? (
              <a
                href={`tel:${primaryPhone}`}
                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:underline cursor-pointer text-xs transition-colors"
                title={`Call ${primaryPhone}`}
              >
                {primaryPhone}
              </a>
            ) : (
              <span className="text-xs text-muted-foreground">
                Not provided
              </span>
            )}
          </div>

          {/* Location */}
          <div>
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Location
            </div>
            <div className="text-xs" title={location}>
              {location.length > 18
                ? `${location.substring(0, 15)}...`
                : location}
            </div>
          </div>

          {/* Contact Method */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Contact Method
            </div>
            <div
              className={`text-xs capitalize flex items-center gap-1 ${contactColor}`}
            >
              <ContactIcon className="w-3 h-3" />
              {contactMethod}
            </div>
          </div>
        </div>

        {/* Contact Notes (if available) */}
        {customer.contact_preferences?.notes && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md">
            <div className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
              Contact Notes:
            </div>
            <div className="text-xs text-blue-800 dark:text-blue-200">
              {customer.contact_preferences.notes}
            </div>
          </div>
        )}

        {/* Additional Contact Info */}
        {(customer.emails?.length > 1 || customer.phones?.length > 1) && (
          <div className="mt-3 pt-2 border-t">
            <div className="flex flex-wrap gap-2 text-xs">
              {customer.emails?.length > 1 && (
                <Badge variant="outline" className="text-xs">
                  +{customer.emails.length - 1} more email
                  {customer.emails.length > 2 ? "s" : ""}
                </Badge>
              )}
              {customer.phones?.length > 1 && (
                <Badge variant="outline" className="text-xs">
                  +{customer.phones.length - 1} more phone
                  {customer.phones.length > 2 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CustomerInfo;
